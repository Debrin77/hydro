"use client"

import React, { useState, useEffect, useMemo } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { 
  Sprout, Activity, Layers, Beaker, Calendar as CalendarIcon, 
  History, Plus, Trash2, FlaskConical, 
  ArrowDownCircle, RefreshCw, Droplets, AlertCircle, Check, Thermometer, Gauge
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
    pH: "6.0", 
    ec: "1.2", 
    waterVol: "20", 
    temp: "20",
    manualTargetEC: "1.2" 
  });

  useEffect(() => {
    const saved = localStorage.getItem("hydroCaru_Final_Order_V29");
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
      localStorage.setItem("hydroCaru_Final_Order_V29", JSON.stringify({ isSetupComplete, plants, params, initialVol, history, lastRotation }));
    }
  }, [isSetupComplete, plants, params, initialVol, history, lastRotation]);

  const systemStatus = useMemo(() => {
    const ph = parseFloat(params.pH) || 0;
    const ec = parseFloat(params.ec) || 0;
    const vol = parseFloat(params.waterVol) || 0;
    const temp = parseFloat(params.temp) || 0;
    const targetEC = parseFloat(params.manualTargetEC) || 1.2;
    const res = [];
    
    if (ph > 6.2) res.push({ title: 'pH ALTO', val: ((ph - 6.0) * vol * 0.1).toFixed(1) + ' ml', desc: 'Añadir pH DOWN', color: 'bg-purple-600', icon: <ArrowDownCircle /> });
    else if (ph < 5.8 && ph > 0) res.push({ title: 'pH BAJO', val: ((6.0 - ph) * vol * 0.1).toFixed(1) + ' ml', desc: 'Añadir pH UP', color: 'bg-orange-500', icon: <ArrowDownCircle className="rotate-180" /> });

    if (ec > (targetEC + 0.1)) {
      const waterToAdd = (vol * (ec - targetEC)) / targetEC;
      res.push({ title: 'EC ALTA', val: waterToAdd.toFixed(1) + ' L', desc: 'Añadir AGUA LIMPIA', color: 'bg-cyan-500', icon: <Droplets /> });
    } else if (ec < targetEC && ec > 0) {
      const nutsToAdd = ((targetEC - ec) / 0.1) * vol * 0.25;
      res.push({ title: 'EC BAJA', val: nutsToAdd.toFixed(1) + ' ml', desc: `Añadir A+B para llegar a ${targetEC}`, color: 'bg-blue-600', icon: <FlaskConical /> });
    }

    if (temp > 25) res.push({ title: 'TEMP ALTA', val: `${temp}°C`, desc: 'Enfriar agua', color: 'bg-red-600', icon: <Thermometer /> });
    if (vol < (parseFloat(initialVol) * 0.5)) res.push({ title: 'AGUA BAJA', val: 'RELLENAR', desc: `Nivel crítico`, color: 'bg-amber-600', icon: <AlertCircle /> });
    
    return { alerts: res, targetEC };
  }, [params, initialVol]);

  const handlePlantAction = (lvl: number, pos: number) => {
    const exists = plants.find(p => p.level === lvl && p.position === pos);
    if (exists) setPlants(plants.filter(p => p.id !== exists.id));
    else setShowPlantSelector({ lvl, pos });
  };

  const renderLevelUI = (lvl: number) => (
    <div key={lvl} className="bg-white p-4 rounded-3xl border mb-4 shadow-sm">
      <p className="text-[10px] font-black text-slate-400 uppercase text-center mb-3">Nivel {lvl}</p>
      <div className="grid grid-cols-3 gap-3">
        {[1, 2, 3, 4, 5, 6].map(pos => {
          const p = plants.find(x => x.level === lvl && x.position === pos);
          return (
            <button key={pos} onClick={() => handlePlantAction(lvl, pos)} className={`aspect-square rounded-2xl flex flex-col items-center justify-center border-2 transition-all ${p ? `${VARIETY_CONFIG[p.variety]?.bg} border-white text-white` : 'bg-slate-50 border-dashed border-slate-200'}`}>
              {p ? <Sprout className="w-5 h-5" /> : <Plus className="w-5 h-5" />}
              {p && <span className="text-[6px] font-black uppercase mt-1 leading-none">{p.variety.split(' ')[0]}</span>}
            </button>
          );
        })}
      </div>
    </div>
  );

  // --- FLUJO DE INICIO CORREGIDO ---
  if (!isSetupComplete) {
    return (
      <div className="min-h-screen bg-slate-100 flex items-center justify-center p-4 font-sans">
        <Card className="w-full max-w-md p-8 bg-white rounded-[3rem] shadow-2xl">
          <h2 className="text-3xl font-black italic text-green-600 text-center mb-8 uppercase tracking-tighter">HydroCaru</h2>
          
          {setupStep === 1 && (
            <div className="space-y-6 animate-in fade-in">
              <div className="bg-slate-50 p-6 rounded-[2rem] border-2 text-center">
                <span className="text-[10px] text-slate-400 font-black uppercase tracking-widest">1. Capacidad del Depósito (L)</span>
                <input type="number" value={initialVol} onChange={e => {setInitialVol(e.target.value); setParams({...params, waterVol: e.target.value})}} className="w-full bg-transparent text-5xl font-black outline-none mt-2 text-center" />
              </div>
              <button onClick={() => setSetupStep(2)} className="w-full bg-slate-900 text-white p-6 rounded-[2rem] font-black uppercase tracking-widest">Siguiente</button>
            </div>
          )}

          {setupStep === 2 && (
            <div className="space-y-6 animate-in slide-in-from-right">
              <p className="text-center text-slate-400 font-bold uppercase text-[10px] tracking-widest">2. Selecciona tus plantas</p>
              {renderLevelUI(1)}
              <button disabled={plants.length === 0} onClick={() => setSetupStep(3)} className="w-full bg-slate-900 text-white p-6 rounded-[2rem] font-black uppercase tracking-widest disabled:opacity-20">Configurar Parámetros</button>
            </div>
          )}

          {setupStep === 3 && (
            <div className="space-y-6 animate-in slide-in-from-right">
              <p className="text-center text-slate-400 font-bold uppercase text-[10px] tracking-widest">3. Parámetros Iniciales</p>
              <div className="space-y-4">
                <div className="bg-blue-600 p-4 rounded-3xl text-white text-center">
                  <label className="text-[8px] uppercase block mb-1 font-black">Objetivo EC Deseado</label>
                  <input type="number" step="0.1" value={params.manualTargetEC} onChange={e => setParams({...params, manualTargetEC: e.target.value})} className="w-full bg-transparent text-3xl outline-none text-center font-black" />
                </div>
                <div className="bg-orange-50 p-4 rounded-3xl border-2 border-orange-100 text-center text-orange-600">
                  <label className="text-[8px] uppercase block mb-1 font-black">Temperatura Agua °C</label>
                  <input type="number" value={params.temp} onChange={e => setParams({...params, temp: e.target.value})} className="w-full bg-transparent text-3xl outline-none text-center font-black" />
                </div>
              </div>
              <button onClick={() => setIsSetupComplete(true)} className="w-full bg-green-600 text-white p-6 rounded-[2rem] font-black uppercase tracking-widest shadow-xl">Iniciar Sistema</button>
            </div>
          )}
        </Card>

        {showPlantSelector && (
          <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[999] flex items-end p-4">
            <div className="bg-white w-full max-w-md mx-auto rounded-[3rem] p-8">
              {Object.keys(VARIETY_CONFIG).map(v => (
                <button key={v} onClick={() => { setPlants([...plants, {id: Date.now(), variety: v, level: showPlantSelector.lvl, position: showPlantSelector.pos}]); setShowPlantSelector(null); }} className={`w-full p-4 mb-2 rounded-2xl font-black text-left ${VARIETY_CONFIG[v].bg} text-white`}>{v}</button>
              ))}
              <button onClick={() => setShowPlantSelector(null)} className="w-full mt-2 p-2 text-slate-400 font-bold uppercase text-[10px]">Cerrar</button>
            </div>
          </div>
        )}
      </div>
    );
  }

  // --- PANEL PRINCIPAL ---
  return (
    <div className="min-h-screen bg-slate-50 pb-32 font-sans">
      <header className="bg-white border-b p-6 flex justify-between items-center sticky top-0 z-50">
        <div className="font-black text-green-600 text-2xl italic tracking-tighter">HydroCaru</div>
        <div className="flex gap-2">
           <Badge className="bg-blue-600 text-white border-none font-black px-3">{params.manualTargetEC} OBJ</Badge>
           <Badge className={`border-none font-black px-3 ${parseFloat(params.temp) > 25 ? 'bg-red-500 text-white' : 'bg-slate-900 text-white'}`}>{params.temp}°C</Badge>
        </div>
      </header>

      <main className="container mx-auto p-4 max-w-md">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid grid-cols-6 h-16 bg-white border shadow-xl rounded-2xl p-1 mb-8">
            <TabsTrigger value="overview"><Activity /></TabsTrigger>
            <TabsTrigger value="measure"><Beaker /></TabsTrigger>
            <TabsTrigger value="tower"><Layers /></TabsTrigger>
            <TabsTrigger value="calendar"><CalendarIcon /></TabsTrigger>
            <TabsTrigger value="history"><History /></TabsTrigger>
            <TabsTrigger value="settings"><Trash2 /></TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-4">
            {systemStatus.alerts.map((alert, i) => (
              <Card key={i} className={`${alert.color} text-white p-6 rounded-[2.5rem] flex items-center gap-6 shadow-lg border-none animate-in slide-in-from-top`}>
                <div className="w-10 h-10">{alert.icon}</div>
                <div><p className="text-[10px] font-black uppercase opacity-70 mb-1">{alert.title}</p><p className="text-3xl font-black leading-none">{alert.val}</p><p className="text-[10px] font-bold uppercase mt-1">{alert.desc}</p></div>
              </Card>
            ))}
            {systemStatus.alerts.length === 0 && (
              <Card className="p-6 rounded-[2.5rem] bg-green-50 text-green-700 border-2 border-green-100 flex items-center gap-4">
                 <Check className="w-6 h-6" /> <p className="font-black uppercase text-xs tracking-widest">Sistema Óptimo</p>
              </Card>
            )}
            <div className="grid grid-cols-2 gap-4 mt-2">
              <Card className="bg-white p-6 rounded-[2rem] border text-center"><p className="text-[8px] font-black text-slate-300 uppercase mb-1">pH</p><p className="text-4xl font-black text-slate-800">{params.pH}</p></Card>
              <Card className="bg-white p-6 rounded-[2rem] border text-center"><p className="text-[8px] font-black text-slate-300 uppercase mb-1">Volumen</p><p className="text-4xl font-black text-blue-600">{params.waterVol}L</p></Card>
            </div>
          </TabsContent>

          <TabsContent value="measure">
            <Card className="p-8 rounded-[3rem] space-y-4 shadow-2xl">
              <div className="space-y-3">
                <div className="bg-blue-600 p-4 rounded-3xl text-white text-center">
                  <label className="text-[8px] uppercase block mb-1 font-black">Ajustar Objetivo EC</label>
                  <input type="number" step="0.1" value={params.manualTargetEC} onChange={e => setParams({...params, manualTargetEC: e.target.value})} className="w-full bg-transparent text-3xl outline-none text-center font-black" />
                </div>
                <div className="grid grid-cols-2 gap-3 font-black">
                  <div className="bg-slate-50 p-4 rounded-3xl border-2 text-center"><label className="text-[8px] text-slate-400 uppercase block mb-1">pH</label><input type="number" step="0.1" value={params.pH} onChange={e => setParams({...params, pH: e.target.value})} className="w-full bg-transparent text-2xl outline-none text-center" /></div>
                  <div className="bg-slate-50 p-4 rounded-3xl border-2 text-center"><label className="text-[8px] text-slate-400 uppercase block mb-1">EC</label><input type="number" step="0.1" value={params.ec} onChange={e => setParams({...params, ec: e.target.value})} className="w-full bg-transparent text-2xl outline-none text-center" /></div>
                  <div className="bg-orange-50 p-4 rounded-3xl border-2 border-orange-100 text-center text-orange-600"><label className="text-[8px] text-orange-400 uppercase block mb-1">Temp °C</label><input type="number" value={params.temp} onChange={e => setParams({...params, temp: e.target.value})} className="w-full bg-transparent text-2xl outline-none text-center" /></div>
                  <div className="bg-cyan-50 p-4 rounded-3xl border-2 border-cyan-100 text-center text-cyan-600"><label className="text-[8px] text-cyan-400 uppercase block mb-1">Vol (L)</label><input type="number" value={params.waterVol} onChange={e => setParams({...params, waterVol: e.target.value})} className="w-full bg-transparent text-2xl outline-none text-center" /></div>
                </div>
                <button onClick={() => { setHistory([{...params, id: Date.now(), date: new Date().toLocaleString()}, ...history]); setActiveTab("overview"); }} className="w-full bg-slate-900 text-white p-6 rounded-[2rem] font-black uppercase mt-4">Guardar Registro</button>
              </div>
            </Card>
          </TabsContent>

          <TabsContent value="tower">
            {[1, 2, 3].map(lvl => renderLevelUI(lvl))}
          </TabsContent>

          <TabsContent value="calendar" className="space-y-4 text-center">
             <Card className="p-8 rounded-[2.5rem] bg-slate-900 text-white">
                <p className="text-[10px] font-black uppercase text-slate-500 mb-2">Próxima Rotación</p>
                <p className="text-4xl font-black tracking-tighter italic">{new Date(new Date(lastRotation).getTime() + 14 * 86400000).toLocaleDateString()}</p>
                <button onClick={() => setLastRotation(new Date().toISOString())} className="mt-4 text-[8px] bg-white/10 px-4 py-2 rounded-full font-bold uppercase">Rotar Hoy</button>
             </Card>
             <Card className="p-6 rounded-[2.5rem] bg-white border">
                <div className="grid grid-cols-7 gap-2">
                  {['L','M','X','J','V','S','D'].map(d => <div key={d} className="text-center text-[10px] font-black text-slate-300">{d}</div>)}
                  {Array.from({length: 31}).map((_, i) => {
                    const day = i + 1;
                    const hasDone = history.some(h => new Date(h.date).getDate() === day);
                    return (
                      <div key={i} className={`aspect-square flex items-center justify-center rounded-xl text-xs font-black ${hasDone ? 'bg-green-500 text-white' : 'bg-slate-50 text-slate-400'}`}>{day}</div>
                    )
                  })}
                </div>
             </Card>
          </TabsContent>

          <TabsContent value="history" className="space-y-3">
             {history.map(h => (
                <Card key={h.id} className="p-4 rounded-[2rem] bg-white border font-black shadow-sm">
                  <p className="text-[7px] text-slate-400 mb-1 uppercase tracking-widest">{h.date}</p>
                  <div className="flex justify-between items-center text-[10px] text-slate-700">
                    <span>pH {h.pH} | EC {h.ec}</span>
                    <span>{h.temp}°C | {h.waterVol}L</span>
                    <Badge className="bg-slate-100 text-[8px] border-none">OBJ: {h.manualTargetEC}</Badge>
                  </div>
                </Card>
             ))}
          </TabsContent>

          <TabsContent value="settings" className="py-10">
             <button onClick={() => {if(confirm('¿BORRAR TODO?')) {localStorage.clear(); window.location.reload();}}} className="w-full bg-red-100 text-red-600 p-8 rounded-[2.5rem] font-black uppercase text-[10px] tracking-widest">Reset de Fábrica</button>
          </TabsContent>
        </Tabs>
      </main>

      {showPlantSelector && (
          <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[999] flex items-end p-4">
            <div className="bg-white w-full max
