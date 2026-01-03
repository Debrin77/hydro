"use client"

import React, { useState, useEffect, useMemo } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { 
  Sprout, Activity, Layers, Beaker, Calendar, 
  Plus, Trash2, FlaskConical, ArrowDownCircle, Droplets, 
  Check, Lock, Lightbulb, AlertTriangle, Thermometer, Scissors, Clock, ShieldAlert
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
    const saved = localStorage.getItem("hydro_v15_final");
    if (saved) {
      const d = JSON.parse(saved);
      setPlants(d.plants || []);
      setParams(d.params);
      setInitialVol(d.initialVol);
      setHistory(d.history || []);
      setLastRotation(d.lastRotation);
      setLastCleaning(d.lastCleaning || new Date().toISOString());
      setIsSetupComplete(d.isSetupComplete);
    }
  }, []);

  useEffect(() => {
    if (isSetupComplete) {
      localStorage.setItem("hydro_v15_final", JSON.stringify({
        isSetupComplete, plants, params, initialVol, history, lastRotation, lastCleaning
      }));
    }
  }, [isSetupComplete, plants, params, initialVol, history, lastRotation, lastCleaning]);

  // --- CÁLCULOS CRÍTICOS ---
  const daysSinceRotation = Math.floor((new Date().getTime() - new Date(lastRotation).getTime()) / 86400000);
  const daysSinceCleaning = Math.floor((new Date().getTime() - new Date(lastCleaning).getTime()) / 86400000);

  const alerts = useMemo(() => {
    const ph = parseFloat(params.pH);
    const ec = parseFloat(params.ec);
    const vol = parseFloat(params.waterVol);
    const target = parseFloat(params.targetEC);
    const list = [];

    if (daysSinceRotation >= 7) list.push({ title: "TOCA ROTAR", val: "7 DÍAS", desc: "Cosechar Nivel 3 e insertar nuevas en Nivel 1", color: "bg-orange-600 animate-pulse", icon: <Clock /> });
    if (daysSinceCleaning >= 30) list.push({ title: "LIMPIEZA", val: "30 DÍAS", desc: "Vaciar y desinfectar depósito", color: "bg-red-700 animate-pulse", icon: <ShieldAlert /> });
    if (ph > 6.2) list.push({ title: "CORRECCIÓN pH", val: `${((ph - 6.0) * vol * 1.5).toFixed(0)}ml`, desc: "Añadir pH DOWN", color: "bg-purple-600", icon: <ArrowDownCircle /> });
    if (ph < 5.5 && ph > 0) list.push({ title: "CORRECCIÓN pH", val: `${((6.0 - ph) * vol * 1.5).toFixed(0)}ml`, desc: "Añadir pH UP", color: "bg-pink-600", icon: <ArrowDownCircle className="rotate-180" /> });
    if (ec < target && ec > 0) list.push({ title: "NUTRIENTES", val: `${(((target - ec) / 0.1) * vol * 0.25).toFixed(1)}ml`, desc: "Añadir solución A+B", color: "bg-blue-700", icon: <FlaskConical /> });
    if (parseFloat(params.temp) > 25) list.push({ title: "TEMPERATURA", val: `${params.temp}°C`, desc: "Añadir botellas de hielo", color: "bg-red-600", icon: <Thermometer /> });
    
    return list;
  }, [params, daysSinceRotation, daysSinceCleaning]);

  const handleRotationAction = () => {
    if (confirm("¿Confirmar: Cosechar Nivel 3 (Abajo) y bajar el resto?")) {
      const remaining = plants.filter(p => p.level !== 3);
      const moved = remaining.map(p => ({ ...p, level: p.level + 1 }));
      setPlants(moved);
      setLastRotation(new Date().toISOString());
      alert("Rotación completada. Nivel 1 (Arriba) libre para 6 nuevas plántulas.");
    }
  };

  const LevelGrid = ({ lvl }: { lvl: number }) => (
    <div className="bg-slate-100 p-4 rounded-3xl grid grid-cols-3 gap-3 border-2 border-slate-200">
      {[1,2,3,4,5,6].map(pos => {
        const p = plants.find(x => x.level === lvl && x.position === pos);
        return (
          <button key={pos} onClick={() => p ? setPlants(plants.filter(x => x.id !== p.id)) : setShowPlantSelector({lvl, pos})} className={`aspect-square rounded-2xl flex flex-col items-center justify-center border-2 ${p ? `${VARIETY_CONFIG[p.variety]?.bg} border-white text-white shadow-md` : 'bg-white border-slate-300 text-slate-300'}`}>
            {p ? <Sprout /> : <Plus />}
            {p && <span className="text-[8px] font-black uppercase mt-1">{p.variety}</span>}
          </button>
        )
      })}
    </div>
  );

  if (!isAuthenticated && !isSetupComplete) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center p-6">
        <Card className="w-full max-w-xs p-8 bg-white rounded-[2rem] text-center shadow-2xl">
          <Lock className="mx-auto mb-4 text-green-600" size={40} />
          <h2 className="text-xl font-black mb-6">HYDROCARU PIN</h2>
          <input type="password" placeholder="****" className="w-full text-center text-3xl font-black bg-slate-100 rounded-xl p-4 outline-none border-2 focus:border-green-500" onChange={(e) => e.target.value === "1234" && setIsAuthenticated(true)} />
        </Card>
      </div>
    );
  }

  if (!isSetupComplete) {
    return (
      <div className="min-h-screen bg-slate-100 flex items-center justify-center p-4">
        <Card className="w-full max-w-md p-8 bg-white rounded-[2rem] shadow-xl space-y-6">
          <h2 className="text-2xl font-black text-center text-green-700 italic underline">CONFIGURACIÓN TORRE</h2>
          <div className="space-y-2">
            <label className="text-xs font-black uppercase">Volumen Total (L)</label>
            <input type="number" value={initialVol} onChange={e => {setInitialVol(e.target.value); setParams({...params, waterVol: e.target.value})}} className="w-full p-4 bg-slate-50 border-2 rounded-2xl text-2xl font-black text-center" />
          </div>
          <button onClick={() => setIsSetupComplete(true)} className="w-full bg-slate-900 text-white p-6 rounded-2xl font-black uppercase shadow-lg">Comenzar Ciclo</button>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 pb-32 font-sans">
      <header className="bg-white border-b-2 p-6 flex justify-between items-center sticky top-0 z-50">
        <div className="text-2xl font-black italic text-green-700">HydroCaru v15</div>
        <Badge className="bg-slate-900 text-white font-black px-4">{params.waterVol}L / {initialVol}L</Badge>
      </header>

      <main className="container mx-auto p-4 max-w-md">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid grid-cols-6 h-14 bg-white border-2 rounded-xl mb-6 overflow-hidden">
            <TabsTrigger value="overview"><Activity size={20}/></TabsTrigger>
            <TabsTrigger value="measure"><Beaker size={20}/></TabsTrigger>
            <TabsTrigger value="tower"><Layers size={20}/></TabsTrigger>
            <TabsTrigger value="history"><Calendar size={20}/></TabsTrigger>
            <TabsTrigger value="tips"><Lightbulb size={20}/></TabsTrigger>
            <TabsTrigger value="settings"><Trash2 size={20}/></TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-4">
            {alerts.map((a, i) => (
              <Card key={i} className={`${a.color} text-white p-5 rounded-[2rem] flex items-center gap-4 shadow-xl border-none`}>
                <div className="bg-white/20 p-3 rounded-full">{a.icon}</div>
                <div><p className="text-[10px] font-black uppercase opacity-80">{a.title}</p><p className="text-2xl font-black">{a.val}</p><p className="text-[10px] font-bold">{a.desc}</p></div>
              </Card>
            ))}
            {alerts.length === 0 && <Card className="p-8 rounded-[2rem] text-center font-black text-green-700 border-2 border-green-200 bg-green-50"><Check className="mx-auto mb-2" size={32}/>ESTADO PERFECTO</Card>}
          </TabsContent>

          <TabsContent value="measure">
            <Card className="p-6 rounded-[2rem] bg-white border-2 space-y-4">
              <div className="bg-blue-600 p-4 rounded-2xl text-white text-center">
                <label className="text-[10px] font-black uppercase">EC Objetivo</label>
                <input type="number" step="0.1" value={params.targetEC} onChange={e => setParams({...params, targetEC: e.target.value})} className="w-full bg-transparent text-4xl text-center font-black outline-none" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1"><label className="text-[10px] font-black text-slate-400">pH REAL</label><input type="number" step="0.1" value={params.pH} onChange={e => setParams({...params, pH: e.target.value})} className="w-full p-4 bg-slate-50 border rounded-xl text-xl font-black text-center" /></div>
                <div className="space-y-1"><label className="text-[10px] font-black text-slate-400">EC REAL</label><input type="number" step="0.1" value={params.ec} onChange={e => setParams({...params, ec: e.target.value})} className="w-full p-4 bg-slate-50 border rounded-xl text-xl font-black text-center" /></div>
                <div className="space-y-1"><label className="text-[10px] font-black text-slate-400">AGUA (L)</label><input type="number" value={params.waterVol} onChange={e => setParams({...params, waterVol: e.target.value})} className="w-full p-4 bg-slate-50 border rounded-xl text-xl font-black text-center" /></div>
                <div className="space-y-1"><label className="text-[10px] font-black text-slate-400">TEMP °C</label><input type="number" value={params.temp} onChange={e => setParams({...params, temp: e.target.value})} className="w-full p-4 bg-slate-50 border rounded-xl text-xl font-black text-center" /></div>
              </div>
              <button onClick={() => { setHistory([{...params, id: Date.now(), date: new Date().toLocaleString()}, ...history]); setActiveTab("overview"); }} className="w-full bg-slate-900 text-white p-5 rounded-2xl font-black uppercase">Guardar y Analizar</button>
            </Card>
          </TabsContent>

          <TabsContent value="tower" className="space-y-6">
            <Card className={`p-6 rounded-[2rem] border-2 flex flex-col items-center gap-4 transition-all ${daysSinceRotation >= 7 ? 'border-orange-500 bg-orange-50' : 'bg-white'}`}>
                <div className="flex justify-between w-full items-center font-black italic">
                    <span className="text-xs">ROTACIÓN SEMANAL</span>
                    <Badge variant={daysSinceRotation >= 7 ? "destructive" : "outline"}>{daysSinceRotation} / 7 días</Badge>
                </div>
                <button onClick={handleRotationAction} className={`w-full p-5 rounded-2xl font-black flex items-center justify-center gap-3 shadow-lg ${daysSinceRotation >= 7 ? 'bg-orange-600 text-white animate-bounce' : 'bg-slate-900 text-white'}`}>
                    <Scissors size={20}/> COSECHAR N3 Y ROTAR
                </button>
            </Card>

            <div className="space-y-4 italic uppercase font-black">
              <div><p className="text-[10px] text-slate-400 ml-4 mb-2">Nivel 1 - Arriba (Nuevas)</p><LevelGrid lvl={1} /></div>
              <div><p className="text-[10px] text-slate-400 ml-4 mb-2">Nivel 2 - Centro</p><LevelGrid lvl={2} /></div>
              <div><p className="text-[10px] text-slate-400 ml-4 mb-2">Nivel 3 - Abajo (Cosechar)</p><LevelGrid lvl={3} /></div>
            </div>
          </TabsContent>

          <TabsContent value="history" className="space-y-6">
            <Card className="p-5 rounded-[2rem] bg-indigo-950 text-white shadow-xl">
                <h3 className="text-xs font-black italic mb-4 text-indigo-300">CALENDARIO RECOMENDADO</h3>
                <div className="grid grid-cols-7 gap-1 text-center">
                    {['L','M','X','J','V','S','D'].map(d => <div key={d} className="text-[8px] opacity-50">{d}</div>)}
                    {Array.from({length: 28}).map((_, i) => {
                        const day = i + 1;
                        const isMeasure = day % 3 === 0;
                        const isRotation = day % 7 === 0;
                        const isCleaning = day === 28;
                        return (
                            <div key={i} className={`h-8 flex flex-col items-center justify-center rounded-md text-[9px] font-black border ${isCleaning ? 'bg-red-500 border-red-400' : isRotation ? 'bg-orange-500 border-orange-400' : isMeasure ? 'bg-blue-500 border-blue-400' : 'bg-white/10 border-white/5'}`}>
                                {day}
                                {isCleaning ? <Trash2 size={8}/> : isRotation ? <Scissors size={8}/> : isMeasure ? <Beaker size={8}/> : null}
                            </div>
                        )
                    })}
                </div>
                <div className="mt-4 flex flex-wrap gap-2 text-[7px] font-bold uppercase">
                    <span className="flex items-center gap-1"><div className="w-2 h-2 bg-blue-500"></div> Medir</span>
                    <span className="flex items-center gap-1"><div className="w-2 h-2 bg-orange-500"></div> Rotar</span>
                    <span className="flex items-center gap-1"><div className="w-2 h-2 bg-red-500"></div> Limpiar</span>
                </div>
            </Card>
            <div className="space-y-3">
                {history.map(h => (
                    <Card key={h.id} className="p-4 rounded-2xl bg-white border-2 flex justify-between items-center font-black">
                        <div className="text-[8px] text-slate-400">{h.date}</div>
                        <div className="flex gap-4 text-xs italic">
                            <span className="text-purple-600">pH {h.pH}</span>
                            <span className="text-blue-600">EC {h.ec}</span>
                            <span className="text-orange-600">{h.temp}°C</span>
                        </div>
                    </Card>
                ))}
            </div>
          </TabsContent>

          <TabsContent value="tips" className="space-y-4">
            <Card className="p-6 rounded-[2rem] bg-orange-50 border-2 border-orange-200">
                <h3 className="font-black flex items-center gap-2 text-orange-700 mb-2"><Layers /> LANA DE ROCA</h3>
                <p className="text-xs font-bold leading-relaxed">1. Sumergir 24h en agua con <span className="underline">pH 5.5</span>. La lana virgen tiene pH 8.0 y bloquea la raíz.<br/><br/>2. No escurrir apretando; deja que el agua salga sola para mantener burbujas de oxígeno dentro.</p>
            </Card>
            <Card className="p-6 rounded-[2rem] bg-emerald-50 border-2 border-emerald-200">
                <h3 className="font-black flex items-center gap-2 text-emerald-700 mb-2"><Info /> LIMPIEZA TOTAL</h3>
                <p className="text-xs font-bold leading-relaxed">Cada 30 días, vacía el depósito. Limpia restos de sales en la bomba con vinagre o ácido cítrico para evitar que se queme el motor.</p>
            </Card>
          </TabsContent>

          <TabsContent value="settings" className="py-6">
            <button onClick={() => {if(confirm('¿BORRAR TODO?')) {localStorage.removeItem("hydro_v15_final"); window.location.reload();}}} className="w-full bg-red-100 text-red-600 p-8 rounded-3xl font-black uppercase text-xs border-2 border-red-200">Resetear Aplicación</button>
            <button onClick={() => {setLastCleaning(new Date().toISOString()); alert('Contador de limpieza reseteado')}} className="w-full mt-4 bg-slate-900 text-white p-5 rounded-3xl font-black uppercase text-xs">Marcar Limpieza Realizada</button>
          </TabsContent>
        </Tabs>
      </main>

      {showPlantSelector && (
        <div className="fixed inset-0 bg-black/80 flex items-end p-4 z-[9999]">
          <div className="bg-white w-full max-w-md mx-auto rounded-[2rem] p-8 space-y-4">
            <h3 className="text-center font-black italic uppercase">Seleccionar Variedad</h3>
            {Object.keys(VARIETY_CONFIG).map(v => (
              <button key={v} onClick={() => {setPlants([...plants, {id: Date.now(), variety: v, level: showPlantSelector.lvl, position: showPlantSelector.pos}]); setShowPlantSelector(null);}} className={`w-full p-5 rounded-2xl font-black text-white ${VARIETY_CONFIG[v].bg}`}>{v}</button>
            ))}
            <button onClick={() => setShowPlantSelector(null)} className="w-full p-2 text-xs font-black uppercase text-slate-400">Cancelar</button>
          </div>
        </div>
      )}
    </div>
  );
}
