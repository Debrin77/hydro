"use client"

import React, { useState, useEffect } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { 
  Sprout, Activity, Layers, Beaker, Calendar as CalendarIcon, 
  History, Plus, Trash2, FlaskConical, 
  ArrowDownCircle, ArrowUpCircle, AlertTriangle, RefreshCw, Check, Clock, Droplets, ChevronRight
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
  const [params, setParams] = useState({ pH: "6.0", ec: "1.2", waterVol: "20" });

  useEffect(() => {
    const saved = localStorage.getItem("hydroCaru_Pro_V18");
    if (saved) {
      const d = JSON.parse(saved);
      if (d.isSetupComplete) {
        setIsSetupComplete(true);
        setPlants(d.plants || []);
        setParams(d.params);
        setHistory(d.history || []);
        setLastRotation(d.lastRotation || new Date().toISOString());
      }
    }
  }, []);

  useEffect(() => {
    if (isSetupComplete) {
      localStorage.setItem("hydroCaru_Pro_V18", JSON.stringify({ isSetupComplete, plants, params, history, lastRotation }));
    }
  }, [isSetupComplete, plants, params, history, lastRotation]);

  // --- LÓGICA DE CÁLCULOS ---
  const currentPH = parseFloat(params.pH) || 0;
  const currentEC = parseFloat(params.ec) || 0;
  const vol = parseFloat(params.waterVol) || 0;
  const targetEC = plants.length > 12 ? 1.6 : plants.length > 6 ? 1.4 : 1.2;

  let phCorr = { active: false, ml: 0, type: "" };
  if (currentPH > 6.2) phCorr = { active: true, ml: (currentPH - 6.0) * vol * 0.1, type: "pH DOWN" };
  else if (currentPH < 5.8 && currentPH > 0) phCorr = { active: true, ml: (6.0 - currentPH) * vol * 0.1, type: "pH UP" };

  const mlNutri = (targetEC - currentEC) > 0 && vol > 0 ? ((targetEC - currentEC) / 0.1) * vol * 0.25 : 0;
  const needsRot = (new Date().getTime() - new Date(lastRotation).getTime()) / (1000 * 60 * 60 * 24) >= 14;

  const saveMeasurement = () => {
    const newEntry = {
      ...params,
      id: Date.now(),
      date: new Date().toLocaleString('es-ES', { weekday: 'short', day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' }),
      correction: {
        phMl: phCorr.active ? phCorr.ml.toFixed(1) : 0,
        phType: phCorr.type,
        ecMl: mlNutri > 0 ? mlNutri.toFixed(1) : 0
      }
    };
    setHistory([newEntry, ...history]);
    setActiveTab("overview");
  };

  const executeRotation = () => {
    let newPlants = plants.filter(p => p.level !== 3).map(p => ({ ...p, level: p.level + 1 }));
    setPlants(newPlants);
    setLastRotation(new Date().toISOString());
    setActiveTab("tower");
  };

  const getDaySchedule = () => {
    const ratio = plants.length / (vol || 1);
    if (ratio > 0.8) return [8, 12, 16, 21];
    if (ratio > 0.4) return [9, 15, 21];
    return [10, 20];
  };

  const renderLevel = (lvl: number) => (
    <div key={lvl} className="bg-white p-4 rounded-3xl border mb-4 shadow-sm">
      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 text-center">Nivel {lvl}</p>
      <div className="grid grid-cols-3 gap-3">
        {[1, 2, 3, 4, 5, 6].map(pos => {
          const p = plants.find(x => x.level === lvl && x.position === pos);
          return (
            <button key={pos} type="button" onClick={() => {
              const exists = plants.find(x => x.level === lvl && x.position === pos);
              if (exists) setPlants(plants.filter(x => x.id !== exists.id));
              else setShowPlantSelector({ lvl, pos });
            }} className={`aspect-square rounded-2xl flex flex-col items-center justify-center border-2 transition-all ${p ? `${VARIETY_CONFIG[p.variety]?.bg} border-white text-white shadow-md` : 'bg-slate-50 border-dashed border-slate-200 text-slate-300'}`}>
              {p ? <Sprout className="w-6 h-6" /> : <Plus className="w-5 h-5" />}
              {p && <span className="text-[6px] font-black uppercase mt-1 leading-none">{p.variety.split(' ')[0]}</span>}
            </button>
          );
        })}
      </div>
    </div>
  );

  if (!isSetupComplete) {
    return (
      <div className="min-h-screen bg-slate-100 flex items-center justify-center p-4">
        <Card className="w-full max-w-md p-8 bg-white rounded-[3rem] shadow-2xl space-y-6">
          <h2 className="text-3xl font-black italic text-green-600 tracking-tighter text-center">HydroCaru</h2>
          {setupStep === 1 ? (
            <div className="space-y-4">
              <div className="bg-slate-50 p-4 rounded-2xl border-2 font-black">
                <span className="text-[9px] text-slate-400 uppercase">Litros</span>
                <input type="text" value={params.waterVol} onChange={e => setParams({...params, waterVol: e.target.value})} className="w-full bg-transparent text-2xl outline-none" />
              </div>
              <div className="bg-slate-50 p-4 rounded-2xl border-2 font-black">
                <span className="text-[9px] text-slate-400 uppercase">pH</span>
                <input type="text" value={params.pH} onChange={e => setParams({...params, pH: e.target.value})} className="w-full bg-transparent text-2xl outline-none" />
              </div>
              <button onClick={() => setSetupStep(2)} className="w-full bg-slate-900 text-white p-6 rounded-3xl font-black">CONTINUAR</button>
            </div>
          ) : (
            <div className="space-y-6">
              <p className="text-center text-slate-400 font-bold uppercase text-xs">Planta el Nivel 1</p>
              {renderLevel(1)}
              <button disabled={plants.length < 6} onClick={() => setIsSetupComplete(true)} className="w-full bg-green-600 text-white p-6 rounded-3xl font-black disabled:opacity-20 shadow-xl">INICIAR APP</button>
            </div>
          )}
        </Card>
        {showPlantSelector && (
          <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[999] flex items-end p-4">
            <div className="bg-white w-full max-w-md mx-auto rounded-[3rem] p-8">
              <div className="grid grid-cols-1 gap-2">
                {Object.keys(VARIETY_CONFIG).map(v => (
                  <button key={v} onClick={() => { setPlants([...plants, {id: Date.now(), variety: v, level: showPlantSelector.lvl, position: showPlantSelector.pos}]); setShowPlantSelector(null); }} 
                    className={`w-full p-5 rounded-2xl font-black text-left flex justify-between items-center ${VARIETY_CONFIG[v].bg} text-white`}>{v} <Plus /></button>
                ))}
                <button onClick={() => setShowPlantSelector(null)} className="w-full p-4 font-bold text-slate-400 text-[10px] uppercase mt-2">Cerrar</button>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 pb-32">
      <header className="bg-white border-b p-6 sticky top-0 z-50 flex justify-between items-center shadow-sm">
        <div className="font-black text-green-600 text-2xl italic tracking-tighter">HydroCaru</div>
        <Badge className="bg-slate-900 text-white rounded-full px-4">{params.waterVol}L</Badge>
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
            <div className="space-y-3">
              {phCorr.active && (
                <Card className="bg-orange-500 text-white p-6 rounded-[2.5rem] flex items-center gap-6 shadow-lg border-none animate-in slide-in-from-top">
                  <ArrowDownCircle className="w-10 h-10 shrink-0" />
                  <div><p className="text-[10px] font-black uppercase opacity-70 mb-1">Ajuste pH</p><p className="text-4xl font-black">{phCorr.ml.toFixed(1)} ml</p><p className="text-[10px] font-bold uppercase">{phCorr.type}</p></div>
                </Card>
              )}
              {mlNutri > 0 && (
                <Card className="bg-blue-600 text-white p-6 rounded-[2.5rem] flex items-center gap-6 shadow-lg border-none animate-in slide-in-from-top">
                  <FlaskConical className="w-10 h-10 shrink-0" />
                  <div><p className="text-[10px] font-black uppercase opacity-70 mb-1">Nutrientes</p><p className="text-4xl font-black">{mlNutri.toFixed(1)} ml</p><p className="text-[10px] font-bold uppercase">Solución A+B</p></div>
                </Card>
              )}
              {vol > 0 && vol < 10 && (
                <Card className="bg-red-500 text-white p-6 rounded-[2.5rem] flex items-center gap-6 shadow-lg border-none animate-pulse">
                  <Droplets className="w-10 h-10 shrink-0" />
                  <div><p className="text-[10px] font-black uppercase opacity-70 mb-1">Nivel Crítico</p><p className="text-2xl font-black">Rellenar Agua</p></div>
                </Card>
              )}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="bg-white p-8 rounded-[2.5rem] border shadow-sm text-center">
                <p className="text-[10px] font-black text-slate-300 uppercase mb-1">pH Actual</p>
                <p className={`text-5xl font-black ${currentPH < 5.8 || currentPH > 6.2 ? 'text-orange-500' : 'text-slate-800'}`}>{params.pH}</p>
              </div>
              <div className="bg-white p-8 rounded-[2.5rem] border shadow-sm text-center">
                <p className="text-[10px] font-black text-slate-300 uppercase mb-1">EC Actual</p>
                <p className="text-5xl font-black text-slate-800">{params.ec}</p>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="measure">
            <Card className="p-8 rounded-[3rem] space-y-6 shadow-2xl border-none">
              <h2 className="text-center font-black text-2xl italic uppercase tracking-tighter">Nueva Toma</h2>
              <div className="space-y-4">
                <div className="bg-slate-50 p-4 rounded-3xl border-2 font-black text-center"><label className="text-[10px] text-slate-400 uppercase block mb-1">pH</label><input type="text" inputMode="decimal" value={params.pH} onChange={e => setParams({...params, pH: e.target.value})} className="w-full bg-transparent text-4xl outline-none text-center" /></div>
                <div className="bg-slate-50 p-4 rounded-3xl border-2 font-black text-center"><label className="text-[10px] text-slate-400 uppercase block mb-1">EC</label><input type="text" inputMode="decimal" value={params.ec} onChange={e => setParams({...params, ec: e.target.value})} className="w-full bg-transparent text-4xl outline-none text-center" /></div>
                <div className="bg-blue-50 p-4 rounded-3xl border-2 border-blue-100 font-black text-center"><label className="text-[10px] text-blue-400 uppercase block mb-1">Agua (L)</label><input type="text" inputMode="decimal" value={params.waterVol} onChange={e => setParams({...params, waterVol: e.target.value})} className="w-full bg-transparent text-4xl outline-none text-center text-blue-600" /></div>
                <button onClick={saveMeasurement} className="w-full bg-slate-900 text-white p-7 rounded-[2.5rem] font-black text-xl shadow-lg">GUARDAR Y CORREGIR</button>
              </div>
            </Card>
          </TabsContent>

          <TabsContent value="tower" className="space-y-2">
            {[1, 2, 3].map(lvl => renderLevel(lvl))}
          </TabsContent>

          <TabsContent value="calendar" className="space-y-6">
            <Card className="p-6 rounded-[2.5rem] border-none bg-white shadow-sm">
               <h3 className="font-black uppercase text-xs text-slate-400 mb-4 text-center tracking-widest">Plan Semanal de Muestreo</h3>
               <div className="grid grid-cols-7 gap-2">
                 {[0, 1, 2, 3, 4, 5, 6].map(i => {
                   const d = new Date(); d.setDate(d.getDate() + i);
                   const isToday = i === 0;
                   return (
                     <div key={i} className={`flex flex-col items-center p-2 rounded-2xl ${isToday ? 'bg-green-600 text-white shadow-md scale-110' : 'bg-slate-50 text-slate-400'}`}>
                       <span className="text-[8px] font-black uppercase mb-1">{d.toLocaleDateString('es-ES', { weekday: 'short' })}</span>
                       <span className="text-sm font-black mb-2">{d.getDate()}</span>
                       <div className="flex flex-col gap-1">
                          {getDaySchedule().map(h => (
                            <div key={h} className={`w-1.5 h-1.5 rounded-full ${isToday ? 'bg-white' : 'bg-green-400 opacity-60'}`} />
                          ))}
                       </div>
                     </div>
                   );
                 })}
               </div>
            </Card>
            
            <Card className="p-6 rounded-[2.5rem] bg-slate-900 text-white space-y-4">
               <div className="flex justify-between items-center">
                 <h4 className="font-black uppercase text-xs tracking-tighter">Horas Hoy</h4>
                 <Badge className="bg-green-500 text-[8px] font-black">{getDaySchedule().length} TOMAS</Badge>
               </div>
               <div className="grid grid-cols-2 gap-2">
                  {getDaySchedule().map(h => (
                    <div key={h} className="bg-white/10 p-3 rounded-xl flex items-center gap-3 border border-white/5">
                      <Clock className="w-4 h-4 text-green-400" />
                      <span className="font-black text-lg">{h}:00</span>
                    </div>
                  ))}
               </div>
            </Card>
          </TabsContent>

          <TabsContent value="history" className="space-y-3">
            {history.map((h: any) => (
              <Card key={h.id} className="p-5 rounded-3xl border shadow-sm bg-white overflow-hidden">
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <p className="text-[8px] font-black text-slate-300 uppercase leading-none mb-1">{h.date}</p>
                    <p className="font-black text-slate-800 text-lg">pH {h.pH} | EC {h.ec}</p>
                  </div>
                  <Badge variant="outline" className="text-[9px] font-black border-slate-100">{h.waterVol}L</Badge>
                </div>
                {(h.correction?.phMl > 0 || h.correction?.ecMl > 0) && (
                  <div className="mt-3 pt-3 border-t border-slate-50 flex gap-2 overflow-x-auto">
                    {h.correction.phMl > 0 && (
                      <div className="bg-orange-50 text-orange-600 px-3 py-1 rounded-full text-[9px] font-black flex items-center gap-1 shrink-0">
                        <ArrowDownCircle className="w-3 h-3" /> {h.correction.phType}: {h.correction.phMl}ml
                      </div>
                    )}
                    {h.correction.ecMl > 0 && (
                      <div className="bg-blue-50 text-blue-600 px-3 py-1 rounded-full text-[9px] font-black flex items-center gap-1 shrink-0">
                        <FlaskConical className="w-3 h-3" /> NUTRI: {h.correction.ecMl}ml
                      </div>
                    )}
                  </div>
                )}
              </Card>
            ))}
          </TabsContent>

          <TabsContent value="settings" className="py-20 text-center">
            <button onClick={() => {localStorage.clear(); window.location.reload();}} className="w-full bg-red-100 text-red-600 p-10 rounded-[3rem] font-black border-2 border-red-200 uppercase text-xs tracking-widest">Borrar todo</button>
          </TabsContent>
        </Tabs>
      </main>
      {showPlantSelector && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-
