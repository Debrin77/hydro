"use client"

import React, { useState, useEffect, useMemo } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { 
  Sprout, Activity, Layers, Beaker, Calendar as CalendarIcon, 
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
    const saved = localStorage.getItem("hydro_v16_blindada");
    if (saved) {
      const d = JSON.parse(saved);
      setPlants(d.plants || []);
      setParams(d.params || { pH: "6.0", ec: "1.2", waterVol: "20", temp: "22", targetEC: "1.4" });
      setInitialVol(d.initialVol || "20");
      setHistory(d.history || []);
      setLastRotation(d.lastRotation || new Date().toISOString());
      setLastCleaning(d.lastCleaning || new Date().toISOString());
      setIsSetupComplete(d.isSetupComplete || false);
    }
  }, []);

  useEffect(() => {
    if (isSetupComplete) {
      localStorage.setItem("hydro_v16_blindada", JSON.stringify({
        isSetupComplete, plants, params, initialVol, history, lastRotation, lastCleaning
      }));
    }
  }, [isSetupComplete, plants, params, initialVol, history, lastRotation, lastCleaning]);

  const daysSinceRotation = Math.floor((new Date().getTime() - new Date(lastRotation).getTime()) / 86400000);
  const daysSinceCleaning = Math.floor((new Date().getTime() - new Date(lastCleaning).getTime()) / 86400000);

  const activeAlerts = useMemo(() => {
    const ph = parseFloat(params.pH) || 0;
    const ec = parseFloat(params.ec) || 0;
    const vol = parseFloat(params.waterVol) || 0;
    const target = parseFloat(params.targetEC) || 1.4;
    const list = [];

    if (daysSinceRotation >= 7) list.push({ title: "ROTACIÓN", val: "7 DÍAS", desc: "Cosechar Nivel 3 (Abajo)", color: "bg-orange-600 animate-pulse", icon: <Clock /> });
    if (daysSinceCleaning >= 30) list.push({ title: "LIMPIEZA", val: "TOCA LAVAR", desc: "Limpiar sales del depósito", color: "bg-red-700", icon: <ShieldAlert /> });
    if (ph > 6.2) list.push({ title: "BAJAR pH", val: `${((ph - 6.0) * vol * 1.5).toFixed(0)}ml`, desc: "Dosis de pH DOWN", color: "bg-purple-600", icon: <ArrowDownCircle /> });
    if (ph < 5.6 && ph > 0) list.push({ title: "SUBIR pH", val: `${((6.0 - ph) * vol * 1.5).toFixed(0)}ml`, desc: "Dosis de pH UP", color: "bg-pink-600", icon: <ArrowDownCircle className="rotate-180" /> });
    if (ec < target && ec > 0) list.push({ title: "NUTRIENTES", val: `${(((target - ec) / 0.1) * vol * 0.25).toFixed(1)}ml`, desc: "Solución A+B", color: "bg-blue-700", icon: <FlaskConical /> });
    if (parseFloat(params.temp) > 25) list.push({ title: "TEMP ALTA", val: `${params.temp}°C`, desc: "Hielo en depósito", color: "bg-red-500", icon: <Thermometer /> });
    
    return list;
  }, [params, daysSinceRotation, daysSinceCleaning]);

  const handleRotation = () => {
    if (confirm("¿Cosechar Nivel 3 (ABAJO) y bajar niveles 1 y 2?")) {
      const remaining = plants.filter(p => p.level !== 3);
      const moved = remaining.map(p => ({ ...p, level: p.level + 1 }));
      setPlants(moved);
      setLastRotation(new Date().toISOString());
    }
  };

  const LevelGrid = ({ lvl }: { lvl: number }) => (
    <div className="bg-slate-100 p-4 rounded-3xl grid grid-cols-3 gap-3 border border-slate-200">
      {[1,2,3,4,5,6].map(pos => {
        const p = plants.find(x => x.level === lvl && x.position === pos);
        return (
          <button key={pos} onClick={() => p ? setPlants(plants.filter(x => x.id !== p.id)) : setShowPlantSelector({lvl, pos})} className={`aspect-square rounded-2xl flex flex-col items-center justify-center border-2 ${p ? `${VARIETY_CONFIG[p.variety]?.bg} border-white text-white shadow-sm` : 'bg-white border-slate-300 text-slate-300'}`}>
            {p ? <Sprout size={20} /> : <Plus size={20} />}
            {p && <span className="text-[7px] font-black uppercase mt-1">{p.variety}</span>}
          </button>
        )
      })}
    </div>
  );

  if (!isAuthenticated && !isSetupComplete) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center p-6 text-slate-800">
        <Card className="w-full max-w-xs p-8 bg-white rounded-[2.5rem] text-center shadow-2xl">
          <Lock className="mx-auto mb-4 text-green-600" size={40} />
          <h2 className="text-xl font-black mb-6 italic">HYDROCARU</h2>
          <input type="password" placeholder="PIN" className="w-full text-center text-3xl font-black bg-slate-100 rounded-2xl p-4 outline-none border-2 focus:border-green-500" onChange={(e) => e.target.value === "1234" && setIsAuthenticated(true)} />
        </Card>
      </div>
    );
  }

  if (!isSetupComplete) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4 text-slate-800">
        <Card className="w-full max-w-md p-8 bg-white rounded-[3rem] shadow-xl space-y-6 border-2 border-green-100">
          <h2 className="text-2xl font-black text-center text-green-700 italic">INICIO DE CICLO</h2>
          <div className="space-y-2">
            <label className="text-xs font-black uppercase ml-2 text-slate-400">Capacidad Depósito (L)</label>
            <input type="number" value={initialVol} onChange={e => {setInitialVol(e.target.value); setParams({...params, waterVol: e.target.value})}} className="w-full p-5 bg-slate-50 border-2 rounded-3xl text-3xl font-black text-center" />
          </div>
          <button onClick={() => setIsSetupComplete(true)} className="w-full bg-slate-900 text-white p-6 rounded-[2rem] font-black uppercase shadow-lg">Activar Sistema</button>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 pb-32 text-slate-800">
      <header className="bg-white border-b-2 p-6 flex justify-between items-center sticky top-0 z-50">
        <div className="text-2xl font-black italic text-green-700">HydroCaru v16</div>
        <Badge className="bg-slate-900 text-white font-black px-4 py-1 rounded-full text-xs italic">{params.waterVol}L / {initialVol}L</Badge>
      </header>

      <main className="container mx-auto p-4 max-w-md">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid grid-cols-6 h-16 bg-white border-2 rounded-2xl mb-8 overflow-hidden shadow-sm">
            <TabsTrigger value="overview"><Activity size={20}/></TabsTrigger>
            <TabsTrigger value="measure"><Beaker size={20}/></TabsTrigger>
            <TabsTrigger value="tower"><Layers size={20}/></TabsTrigger>
            <TabsTrigger value="history"><CalendarIcon size={20}/></TabsTrigger>
            <TabsTrigger value="tips"><Lightbulb size={20}/></TabsTrigger>
            <TabsTrigger value="settings"><Trash2 size={20}/></TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-4">
            {activeAlerts.map((a, i) => (
              <Card key={i} className={`${a.color} text-white p-6 rounded-[2.5rem] flex items-center gap-5 shadow-lg border-none`}>
                <div className="bg-white/20 p-3 rounded-2xl">{a.icon}</div>
                <div><p className="text-[10px] font-black uppercase opacity-80">{a.title}</p><p className="text-3xl font-black italic">{a.val}</p><p className="text-[10px] font-bold uppercase">{a.desc}</p></div>
              </Card>
            ))}
            {activeAlerts.length === 0 && <Card className="p-10 rounded-[2.5rem] text-center font-black text-green-700 border-2 border-green-200 bg-green-50"><Check className="mx-auto mb-2" size={40}/>SISTEMA CORRECTO</Card>}
          </TabsContent>

          <TabsContent value="measure">
            <Card className="p-8 rounded-[3rem] bg-white border-2 space-y-6 shadow-sm">
              <div className="bg-blue-600 p-5 rounded-3xl text-white text-center shadow-inner">
                <label className="text-[10px] font-black uppercase opacity-60">EC de Referencia</label>
                <input type="number" step="0.1" value={params.targetEC} onChange={e => setParams({...params, targetEC: e.target.value})} className="w-full bg-transparent text-5xl text-center font-black outline-none" />
              </div>
              <div className="grid grid-cols-2 gap-4 font-black">
                <div className="space-y-1"><label className="text-[9px] text-slate-400 ml-2 uppercase">pH REAL</label><input type="number" step="0.1" value={params.pH} onChange={e => setParams({...params, pH: e.target.value})} className="w-full p-4 bg-slate-50 border-2 rounded-2xl text-2xl text-center" /></div>
                <div className="space-y-1"><label className="text-[9px] text-slate-400 ml-2 uppercase">EC REAL</label><input type="number" step="0.1" value={params.ec} onChange={e => setParams({...params, ec: e.target.value})} className="w-full p-4 bg-slate-50 border-2 rounded-2xl text-2xl text-center" /></div>
                <div className="space-y-1"><label className="text-[9px] text-cyan-600 ml-2 uppercase">AGUA (L)</label><input type="number" value={params.waterVol} onChange={e => setParams({...params, waterVol: e.target.value})} className="w-full p-4 bg-cyan-50 border-2 border-cyan-100 rounded-2xl text-2xl text-center" /></div>
                <div className="space-y-1"><label className="text-[9px] text-orange-600 ml-2 uppercase">TEMP °C</label><input type="number" value={params.temp} onChange={e => setParams({...params, temp: e.target.value})} className="w-full p-4 bg-orange-50 border-2 border-orange-100 rounded-2xl text-2xl text-center" /></div>
              </div>
              <button onClick={() => { setHistory([{...params, id: Date.now(), date: new Date().toLocaleString()}, ...history]); setActiveTab("overview"); }} className="w-full bg-slate-900 text-white p-6 rounded-[2rem] font-black uppercase shadow-xl transition-transform active:scale-95">Guardar Registro</button>
            </Card>
          </TabsContent>

          <TabsContent value="tower" className="space-y-6">
            <Card className={`p-6 rounded-[2.5rem] border-2 flex flex-col items-center gap-4 ${daysSinceRotation >= 7 ? 'border-orange-500 bg-orange-50' : 'bg-white'}`}>
                <div className="flex justify-between w-full items-center font-black italic">
                    <span className="text-[10px] uppercase text-slate-400">Control de Rotación</span>
                    <Badge variant={daysSinceRotation >= 7 ? "destructive" : "secondary"}>{daysSinceRotation} / 7 días</Badge>
                </div>
                <button onClick={handleRotation} className={`w-full p-6 rounded-[2rem] font-black flex items-center justify-center gap-3 shadow-lg ${daysSinceRotation >= 7 ? 'bg-orange-600 text-white animate-bounce' : 'bg-slate-900 text-white'}`}>
                    <Scissors size={20}/> COSECHAR N3 Y ROTAR
                </button>
            </Card>
            <div className="space-y-6">
              <div><p className="text-[10px] font-black text-slate-400 ml-4 mb-2 uppercase italic">Nivel 1 - ARRIBA (Nuevas)</p><LevelGrid lvl={1} /></div>
              <div><p className="text-[10px] font-black text-slate-400 ml-4 mb-2 uppercase italic">Nivel 2 - CENTRO</p><LevelGrid lvl={2} /></div>
              <div><p className="text-[10px] font-black text-slate-400 ml-4 mb-2 uppercase italic">Nivel 3 - ABAJO (Cosecha)</p><LevelGrid lvl={3} /></div>
            </div>
          </TabsContent>

          <TabsContent value="history" className="space-y-6">
            <Card className="p-6 rounded-[2.5rem] bg-slate-900 text-white shadow-xl overflow-hidden border-none relative">
                <div className="absolute top-0 right-0 p-4 opacity-10"><CalendarIcon size={80}/></div>
                <h3 className="text-xs font-black italic mb-4 text-green-400 uppercase tracking-widest">Calendario de Muestreo</h3>
                <div className="grid grid-cols-7 gap-1">
                    {['L','M','X','J','V','S','D'].map(d => <div key={d} className="text-[8px] text-center font-black opacity-40">{d}</div>)}
                    {Array.from({length: 28}).map((_, i) => {
                        const day = i + 1;
                        const isMeasure = day % 3 === 0;
                        const isRotation = day % 7 === 0;
                        const isCleaning = day === 28;
                        return (
                            <div key={i} className={`h-9 flex flex-col items-center justify-center rounded-lg text-[10px] font-black border ${isCleaning ? 'bg-red-500 border-red-400' : isRotation ? 'bg-orange-500 border-orange-400' : isMeasure ? 'bg-blue-600 border-blue-400' : 'bg-white/5 border-white/5 opacity-30'}`}>
                                {day}
                                <div className="flex gap-0.5 mt-0.5">
                                    {isCleaning && <div className="w-1 h-1 bg-white rounded-full"></div>}
                                    {isRotation && <div className="w-1 h-1 bg-white rounded-full"></div>}
                                    {isMeasure && <div className="w-1 h-1 bg-white rounded-full"></div>}
                                </div>
                            </div>
                        )
                    })}
                </div>
                <div className="mt-4 flex justify-between text-[7px] font-black uppercase opacity-60">
                   <span className="flex items-center gap-1"><div className="w-1.5 h-1.5 bg-blue-600 rounded-full"></div> Medir</span>
                   <span className="flex items-center gap-1"><div className="w-1.5 h-1.5 bg-orange-500 rounded-full"></div> Rotar</span>
                   <span className="flex items-center gap-1"><div className="w-1.5 h-1.5 bg-red-500 rounded-full"></div> Limpiar</span>
                </div>
            </Card>
            <div className="space-y-3">
                {history.slice(0, 10).map(h => (
                    <Card key={h.id} className="p-4 rounded-2xl bg-white border flex justify-between items-center font-black shadow-sm">
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
            <Card className="p-6 rounded-[2.5rem] bg-white border-2 border-orange-100 shadow-sm overflow-hidden relative">
                <div className="absolute -right-4 -top-4 opacity-5 text-orange-500"><Layers size={100}/></div>
                <h3 className="font-black flex items-center gap-2 text-orange-700 mb-2 uppercase text-sm italic italic">Protocolo Lana de Roca</h3>
                <p className="text-xs font-bold leading-relaxed text-slate-600 italic">
                  1. <span className="text-orange-600">Neutralización:</span> Sumergir 24h en agua pH 5.5. Sin esto, la raíz se quema al nacer.<br/><br/>
                  2. <span className="text-orange-600">Humedad Capilar:</span> Nunca estrujes la lana. Si la aprietas, eliminas los micro-espacios de oxígeno y la raíz se pudre.
                </p>
            </Card>
            <Card className="p-6 rounded-[2.5rem] bg-white border-2 border-emerald-100 shadow-sm overflow-hidden relative">
                <div className="absolute -right-4 -top-4 opacity-5 text-emerald-500"><Info size={100}/></div>
                <h3 className="font-black flex items-center gap-2 text-emerald-700 mb-2 uppercase text-sm italic italic">Mantenimiento de Motor</h3>
                <p className="text-xs font-bold leading-relaxed text-slate-600 italic">
                  La caliza es el enemigo. Cada mes, sumerge la bomba en agua con vinagre durante 1 hora para disolver sales. Una bomba limpia mantiene el oxígeno alto.
                </p>
            </Card>
          </TabsContent>

          <TabsContent value="settings" className="py-6 space-y-4">
            <button onClick={() => {if(confirm('¿BORRAR TODO?')) {localStorage.removeItem("hydro_v16_blindada"); window.location.reload();}}} className="w-full bg-red-100 text-red-600 p-8 rounded-[2.5rem] font-black uppercase text-xs border-2 border-red-200 shadow-md">Resetear App</button>
            <button onClick={() => {setLastCleaning(new Date().toISOString()); alert('Limpieza registrada')}} className="w-full bg-slate-900 text-white p-6 rounded-[2.5rem] font-black uppercase text-xs shadow-xl">Marcar Limpieza Hoy</button>
            <p className="text-center text-[8px] font-black text-slate-300 uppercase italic tracking-widest mt-10">HydroCaru v16.0 Blindada Edition</p>
          </TabsContent>
        </Tabs>
      </main>

      {showPlantSelector && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-end p-4 z-[9999]">
          <div className="bg-white w-full max-w-md mx-auto rounded-[3rem] p-8 space-y-4 shadow-2xl">
            <h3 className="text-center font-black italic uppercase text-slate-400">Variedad de Semilla</h3>
            <div className="grid gap-2">
              {Object.keys(VARIETY_CONFIG).map(v => (
                <button key={v} onClick={() => {setPlants([...plants, {id: Date.now(), variety: v, level: showPlantSelector.lvl, position: showPlantSelector.pos}]); setShowPlantSelector(null);}} className={`w-full p-5 rounded-2xl font-black text-white shadow-lg ${VARIETY_CONFIG[v].bg}`}>{v}</button>
              ))}
            </div>
            <button onClick={() => setShowPlantSelector(null)} className="w-full p-2 text-xs font-black uppercase text-slate-400">Cancelar</button>
          </div>
        </div>
      )}
    </div>
  );
}
