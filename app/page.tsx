"use client"

import React, { useState, useEffect, useMemo } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { 
  Sprout, Activity, Layers, Beaker, Calendar as CalendarIcon, 
  History, Plus, Trash2, FlaskConical, 
  ArrowDownCircle, Droplets, AlertCircle, Check, Thermometer, Gauge
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
  const [isSetupComplete, setIsSetupComplete] = useState(false);
  const [setupStep, setSetupStep] = useState(1);
  const [activeTab, setActiveTab] = useState("overview");
  const [plants, setPlants] = useState<any[]>([]);
  const [history, setHistory] = useState<any[]>([]);
  const [lastRotation, setLastRotation] = useState<string>(new Date().toISOString());
  const [showPlantSelector, setShowPlantSelector] = useState<{lvl: number, pos: number} | null>(null);
  
  const [initialVol, setInitialVol] = useState("20");
  const [params, setParams] = useState({ 
    pH: "6.0", ec: "1.2", waterVol: "20", temp: "22", manualTargetEC: "1.2" 
  });

  useEffect(() => {
    const saved = localStorage.getItem("hydroCaru_ULTRA_V35_FINAL");
    if (saved) {
      const d = JSON.parse(saved);
      if (d.isSetupComplete) {
        setIsSetupComplete(true);
        setPlants(d.plants || []);
        setParams(d.params);
        setInitialVol(d.initialVol || "20");
        setHistory(d.history || []);
        setLastRotation(d.lastRotation || new Date().toISOString());
      }
    }
  }, []);

  useEffect(() => {
    if (isSetupComplete) {
      localStorage.setItem("hydroCaru_ULTRA_V35_FINAL", JSON.stringify({
        isSetupComplete, plants, params, initialVol, history, lastRotation
      }));
    }
  }, [isSetupComplete, plants, params, initialVol, history, lastRotation]);

  const systemStatus = useMemo(() => {
    const ph = parseFloat(params.pH) || 0;
    const ec = parseFloat(params.ec) || 0;
    const currentVol = parseFloat(params.waterVol) || 0;
    const maxVol = parseFloat(initialVol) || 20;
    const targetEC = parseFloat(params.manualTargetEC) || 1.2;
    const alerts = [];
    
    if (currentVol < maxVol) {
        const diff = maxVol - currentVol;
        if (diff >= 0.5) {
            alerts.push({ 
                title: 'RELLENAR AGUA', val: `${diff.toFixed(1)} L`, 
                desc: `Faltan ${diff.toFixed(1)}L para ${maxVol}L`, 
                color: currentVol < (maxVol * 0.6) ? 'bg-orange-600' : 'bg-cyan-600', 
                icon: <Droplets /> 
            });
        }
    }

    if (ph > 6.2) alerts.push({ title: 'pH ALTO', val: ((ph - 6.0) * currentVol * 0.1).toFixed(1) + ' ml', desc: 'Usar pH DOWN', color: 'bg-purple-600', icon: <ArrowDownCircle /> });
    if (ph < 5.8 && ph > 0) alerts.push({ title: 'pH BAJO', val: ((6.0 - ph) * currentVol * 0.1).toFixed(1) + ' ml', desc: 'Usar pH UP', color: 'bg-pink-600', icon: <ArrowDownCircle className="rotate-180" /> });

    if (ec > (targetEC + 0.1)) {
      alerts.push({ title: 'EC ALTA', val: 'DILUIR', desc: `Añadir agua sola`, color: 'bg-sky-500', icon: <Droplets /> });
    } else if (ec < targetEC && ec > 0) {
      const nutrients = ((targetEC - ec) / 0.1) * currentVol * 0.25;
      alerts.push({ title: 'EC BAJA', val: nutrients.toFixed(1) + ' ml', desc: `Añadir A+B`, color: 'bg-blue-700', icon: <FlaskConical /> });
    }
    
    return { alerts };
  }, [params, initialVol]);

  const LevelGrid = ({ lvl }: { lvl: number }) => (
    <div className="bg-slate-50 p-4 rounded-[2rem] border-2 border-dashed border-slate-200 grid grid-cols-3 gap-3">
      {[1, 2, 3, 4, 5, 6].map(pos => {
        const p = plants.find(x => x.level === lvl && x.position === pos);
        return (
          <button key={pos} onClick={() => {
            if (p) setPlants(plants.filter(x => x.id !== p.id));
            else setShowPlantSelector({ lvl, pos });
          }} className={`aspect-square rounded-2xl flex flex-col items-center justify-center border-2 transition-all ${p ? `${VARIETY_CONFIG[p.variety]?.bg} border-white text-white shadow-md` : 'bg-white border-slate-200 text-slate-300'}`}>
            {p ? <Sprout className="w-6 h-6" /> : <Plus className="w-5 h-5" />}
            {p && <span className="text-[7px] font-black uppercase mt-1">{p.variety.split(' ')[0]}</span>}
          </button>
        );
      })}
    </div>
  );

  const handleManualRotation = () => {
    if(confirm('¿Confirmas la rotación? El Nivel 3 se cosecha, el 2 baja al 3 y el 1 al 2. El Nivel 1 quedará vacío.')) {
      const remainingPlants = plants.filter(p => p.level !== 3);
      const rotatedPlants = remainingPlants.map(p => ({
        ...p,
        level: p.level + 1
      }));
      setPlants(rotatedPlants);
      setLastRotation(new Date().toISOString());
      alert('¡Rotación lista! No olvides añadir tus 6 nuevas plántulas al Nivel 1.');
    }
  };

  if (!isSetupComplete) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4">
        <Card className="w-full max-w-md p-8 bg-white rounded-[3rem] shadow-2xl relative overflow-hidden">
          <h2 className="text-3xl font-black italic text-green-600 text-center mb-6 uppercase tracking-tighter">HydroCaru</h2>
          {setupStep === 1 && (
            <div className="space-y-6 animate-in slide-in-from-bottom">
              <div className="text-center"><p className="text-[10px] font-black text-slate-400 uppercase mb-4 tracking-widest">Capacidad</p><h3 className="text-xl font-black mb-4">¿Litros totales del depósito?</h3><input type="number" value={initialVol} onChange={e => {setInitialVol(e.target.value); setParams({...params, waterVol: e.target.value})}} className="w-full bg-slate-50 rounded-3xl p-6 text-5xl font-black text-center border-2 border-green-100 outline-none text-green-600" /></div>
              <button onClick={() => setSetupStep(2)} className="w-full bg-slate-900 text-white p-6 rounded-[2rem] font-black uppercase">Siguiente</button>
            </div>
          )}
          {setupStep === 2 && (
            <div className="space-y-6 animate-in slide-in-from-right">
              <div className="text-center"><p className="text-[10px] font-black text-slate-400 uppercase mb-4 tracking-widest">Plantas</p><h3 className="text-xl font-black mb-4">Añade al menos una planta</h3><LevelGrid lvl={1} /></div>
              <button disabled={plants.length === 0} onClick={() => setSetupStep(3)} className="w-full bg-slate-900 text-white p-6 rounded-[2rem] font-black uppercase disabled:opacity-20">Siguiente</button>
            </div>
          )}
          {setupStep === 3 && (
            <div className="space-y-6 animate-in slide-in-from-right">
              <div className="text-center"><p className="text-[10px] font-black text-slate-400 uppercase mb-4 tracking-widest">Parámetros</p>
                <div className="bg-blue-600 p-4 rounded-3xl text-white mb-3"><label className="text-[8px] font-black block">EC OBJETIVO</label><input type="number" step="0.1" value={params.manualTargetEC} onChange={e => setParams({...params, manualTargetEC: e.target.value})} className="w-full bg-transparent text-4xl font-black text-center outline-none" /></div>
              </div>
              <button onClick={() => setIsSetupComplete(true)} className="w-full bg-green-600 text-white p-6 rounded-[2rem] font-black uppercase shadow-xl">Finalizar</button>
            </div>
          )}
        </Card>
        {showPlantSelector && (
          <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[999] flex items-end p-4">
            <div className="bg-white w-full max-w-md mx-auto rounded-[3.5rem] p-10">
              {Object.keys(VARIETY_CONFIG).map(v => ( <button key={v} onClick={() => { setPlants([...plants, {id: Date.now(), variety: v, level: showPlantSelector.lvl, position: showPlantSelector.pos}]); setShowPlantSelector(null); }} className={`w-full p-5 mb-3 rounded-2xl font-black text-left ${VARIETY_CONFIG[v].bg} text-white`}>{v}</button> ))}
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 pb-32 font-sans">
      <header className="bg-white border-b p-6 flex justify-between items-center sticky top-0 z-50">
        <div className="font-black text-green-600 text-2xl italic">HydroCaru</div>
        <Badge className="bg-slate-900 text-white font-black">{params.waterVol}L / {initialVol}L</Badge>
      </header>

      <main className="container mx-auto p-4 max-w-md">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid grid-cols-6 h-16 bg-white border-2 shadow-xl rounded-[1.5rem] p-1 mb-8">
            <TabsTrigger value="overview"><Activity/></TabsTrigger>
            <TabsTrigger value="measure"><Beaker/></TabsTrigger>
            <TabsTrigger value="tower"><Layers/></TabsTrigger>
            <TabsTrigger value="calendar"><CalendarIcon/></TabsTrigger>
            <TabsTrigger value="history"><History/></TabsTrigger>
            <TabsTrigger value="settings"><Trash2/></TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-4">
            {systemStatus.alerts.map((alert, i) => (
              <Card key={i} className={`${alert.color} text-white p-6 rounded-[2.5rem] flex items-center gap-6 border-none`}>
                <div className="w-10 h-10">{alert.icon}</div>
                <div><p className="text-[10px] font-black uppercase opacity-70">{alert.title}</p><p className="text-3xl font-black">{alert.val}</p><p className="text-[10px] font-bold uppercase">{alert.desc}</p></div>
              </Card>
            ))}
            {systemStatus.alerts.length === 0 && (
              <Card className="p-8 rounded-[2.5rem] bg-green-50 text-green-700 border-2 border-green-100 flex items-center justify-center gap-4"><Check/> <span className="font-black uppercase text-sm">Todo Correcto</span></Card>
            )}
          </TabsContent>

          <TabsContent value="measure">
            <Card className="p-8 rounded-[3rem] space-y-4 bg-white border-none shadow-2xl">
              <div className="bg-blue-600 p-5 rounded-3xl text-white text-center"><label className="text-[9px] font-black uppercase opacity-80">EC Objetivo Manual</label><input type="number" step="0.1" value={params.manualTargetEC} onChange={e => setParams({...params, manualTargetEC: e.target.value})} className="w-full bg-transparent text-4xl outline-none text-center font-black" /></div>
              <div className="grid grid-cols-2 gap-3 font-black">
                <div className="bg-slate-50 p-4 rounded-3xl border-2 text-center"><label className="text-[8px] text-slate-400 block">pH</label><input type="number" step="0.1" value={params.pH} onChange={e => setParams({...params, pH: e.target.value})} className="w-full bg-transparent text-2xl text-center outline-none" /></div>
                <div className="bg-slate-50 p-4 rounded-3xl border-2 text-center"><label className="text-[8px] text-slate-400 block">EC</label><input type="number" step="0.1" value={params.ec} onChange={e => setParams({...params, ec: e.target.value})} className="w-full bg-transparent text-2xl text-center outline-none" /></div>
                <div className="bg-cyan-50 p-4 rounded-3xl border-2 border-cyan-100 text-center text-cyan-600"><label className="text-[8px] uppercase block">Agua (L)</label><input type="number" value={params.waterVol} onChange={e => setParams({...params, waterVol: e.target.value})} className="w-full bg-transparent text-2xl text-center outline-none font-black" /></div>
                <div className="bg-orange-50 p-4 rounded-3xl border-2 border-orange-100 text-center text-orange-600"><label className="text-[8px] block">Temp °C</label><input type="number" value={params.temp} onChange={e => setParams({...params, temp: e.target.value})} className="w-full bg-transparent text-2xl text-center outline-none" /></div>
              </div>
              <button onClick={() => { setHistory([{...params, id: Date.now(), date: new Date().toLocaleString()}, ...history]); setActiveTab("overview"); }} className="w-full bg-slate-900 text-white p-6 rounded-[2rem] font-black uppercase">Guardar Registro</button>
            </Card>
          </TabsContent>

          <TabsContent value="tower" className="space-y-6">
            {[1, 2, 3].map(lvl => (
              <div key={lvl}><p className="text-[10px] font-black text-slate-400 uppercase mb-2 ml-2 tracking-widest italic">Nivel {lvl}</p><LevelGrid lvl={lvl} /></div>
            ))}
          </TabsContent>

          <TabsContent value="calendar" className="space-y-4">
             <Card className="p-8 rounded-[2.5rem] bg-slate-900 text-white text-center shadow-2xl">
                <p className="text-[10px] font-black uppercase text-slate-500 mb-2">Próxima Limpieza y Rotación</p>
                <p className="text-4xl font-black italic">{new Date(new Date(lastRotation).getTime() + 14 * 86400000).toLocaleDateString()}</p>
                <button onClick={handleManualRotation} className="mt-4 text-[8px] bg-red-600 px-6 py-2 rounded-full font-black uppercase shadow-lg animate-pulse">Confirmar Rotación Hoy</button>
             </Card>
             <Card className="p-6 rounded-[2.5rem] bg-white border-2 grid grid-cols-7 gap-2">
                {['L','M','X','J','V','S','D'].map(d => <div key={d} className="text-center text-[10px] font-black text-slate-300">{d}</div>)}
                {Array.from({length: 31}).map((_, i) => {
                  const day = i + 1;
                  const date = new Date(new Date().getFullYear(), new Date().getMonth(), day);
                  const isMeasureDay = [1, 3, 5].includes(date.getDay());
                  const hasDone = history.some(h => new Date(h.date).getDate() === day);
                  return (
                    <div key={i} className={`aspect-square flex flex-col items-center justify-center rounded-xl text-xs font-black relative ${hasDone ? 'bg-green-500 text-white' : 'bg-slate-50 text-slate-400'}`}>
                      {day} {isMeasureDay && !hasDone && <div className="w-1 h-1 rounded-full bg-blue-500 mt-0.5"></div>}
                    </div>
                  )
                })}
             </Card>
          </TabsContent>

          <TabsContent value="history" className="space-y-3">
             {history.map(h => (
                <Card key={h.id} className="p-4 rounded-[2rem] bg-white border-2 font-black shadow-sm flex flex-col gap-2">
                  <p className="text-[8px] text-slate-400">{h.date}</p>
                  <div className="flex justify-between items-center text-[10px]">
                    <span className="flex items-center gap-1"><Gauge className="w-3 h-3"/> pH {h.pH} | EC {h.ec}</span>
                    <span className="flex items-center gap-1 text-blue-600"><Droplets className="w-3 h-3"/> {h.waterVol}L</span>
                  </div>
                </Card>
             ))}
          </TabsContent>

          <TabsContent value="settings" className="py-10">
             <button onClick={() => {if(confirm('¿BORRAR TODO?')) {localStorage.removeItem("hydroCaru_ULTRA_V35_FINAL"); window.location.reload();}}} className="w-full bg-red-100 text-red-600 p-8 rounded-[3rem] font-black uppercase text-[10px] tracking-widest border-2 border-red-200">Reset de Fábrica</button>
          </TabsContent>
        </Tabs>
      </main>

      {showPlantSelector && (
          <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[999] flex items-end p-4">
            <div className="bg-white w-full max-w-md mx-auto rounded-[3.5rem] p-10 animate-in slide-in-from-bottom">
              {Object.keys(VARIETY_CONFIG).map(v => ( <button key={v} onClick={() => { setPlants([...plants, {id: Date.now(), variety: v, level: showPlantSelector.lvl, position: showPlantSelector.pos}]); setShowPlantSelector(null); }} className={`w-full p-5 mb-3 rounded-2xl font-black text-left ${VARIETY_CONFIG[v].bg} text-white`}>{v}</button> ))}
              <button onClick={() => setShowPlantSelector(null)} className="w-full mt-4 p-2 text-slate-400 font-bold uppercase text-[10px]">Cerrar</button>
            </div>
          </div>
      )}
    </div>
  );
}
