"use client"

import React, { useState, useEffect, useMemo } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { 
  Sprout, Activity, Layers, Beaker, Calendar as CalendarIcon, 
  History, Plus, Trash2, FlaskConical, 
  ArrowDownCircle, RefreshCw, Clock, Droplets, AlertCircle
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
  const [params, setParams] = useState({ pH: "6.0", ec: "1.2", waterVol: "20" });

  useEffect(() => {
    const saved = localStorage.getItem("hydroCaru_Final_V25");
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
      localStorage.setItem("hydroCaru_Final_V25", JSON.stringify({ isSetupComplete, plants, params, initialVol, history, lastRotation }));
    }
  }, [isSetupComplete, plants, params, initialVol, history, lastRotation]);

  // --- MOTOR DE ALERTAS (CÁLCULO FORZADO) ---
  const alerts = useMemo(() => {
    const ph = parseFloat(params.pH) || 0;
    const ec = parseFloat(params.ec) || 0;
    const vol = parseFloat(params.waterVol) || 0;
    const target = plants.length > 12 ? 1.6 : plants.length > 6 ? 1.4 : 1.2;

    const list = [];

    // Lógica pH
    if (ph > 6.2) {
      list.push({ type: 'pH', title: 'pH ALTO', val: ((ph - 6.0) * vol * 0.1).toFixed(1) + ' ml', desc: 'Añadir pH DOWN', color: 'bg-purple-600', icon: <ArrowDownCircle /> });
    } else if (ph < 5.8 && ph > 0) {
      list.push({ type: 'pH', title: 'pH BAJO', val: ((6.0 - ph) * vol * 0.1).toFixed(1) + ' ml', desc: 'Añadir pH UP', color: 'bg-orange-500', icon: <ArrowDownCircle className="rotate-180" /> });
    }

    // Lógica EC
    if (ec > (target + 0.1)) {
      const water = (vol * (ec - target)) / target;
      list.push({ type: 'EC', title: 'EC ALTA (DILUIR)', val: water.toFixed(1) + ' L', desc: 'Añadir AGUA LIMPIA', color: 'bg-cyan-500', icon: <Droplets /> });
    } else if (ec < target && ec > 0) {
      const nuts = ((target - ec) / 0.1) * vol * 0.25;
      list.push({ type: 'EC', title: 'EC BAJA', val: nuts.toFixed(1) + ' ml', desc: 'Añadir NUTRIENTES A+B', color: 'bg-blue-600', icon: <FlaskConical /> });
    }

    // Volumen bajo
    if (vol < (parseFloat(initialVol) * 0.5)) {
      list.push({ type: 'VOL', title: 'DEPÓSITO BAJO', val: 'RELLENAR', desc: `Nivel actual: ${vol}L`, color: 'bg-amber-500', icon: <AlertCircle /> });
    }

    return list;
  }, [params, initialVol, plants.length]);

  const handlePlantAction = (lvl: number, pos: number) => {
    const exists = plants.find(p => p.level === lvl && p.position === pos);
    if (exists) setPlants(plants.filter(p => p.id !== exists.id));
    else setShowPlantSelector({ lvl, pos });
  };

  if (!isSetupComplete) {
    return (
      <div className="min-h-screen bg-slate-100 flex items-center justify-center p-4 font-sans">
        <Card className="w-full max-w-md p-8 bg-white rounded-[3rem] shadow-2xl">
          <h2 className="text-3xl font-black italic text-green-600 text-center mb-8 uppercase tracking-tighter">HydroCaru</h2>
          {setupStep === 1 ? (
            <div className="space-y-6">
              <div className="bg-slate-50 p-6 rounded-[2rem] border-2 font-black">
                <span className="text-[10px] text-slate-400 uppercase">Capacidad Tanque (L)</span>
                <input type="number" value={initialVol} onChange={e => {setInitialVol(e.target.value); setParams({...params, waterVol: e.target.value})}} className="w-full bg-transparent text-4xl outline-none mt-2" />
              </div>
              <button onClick={() => setSetupStep(2)} className="w-full bg-slate-900 text-white p-6 rounded-[2rem] font-black uppercase tracking-widest">Siguiente</button>
            </div>
          ) : (
            <div className="space-y-6">
              <p className="text-center text-slate-400 font-bold uppercase text-[10px] tracking-widest">Planta el Nivel 1 (6 Plantas)</p>
              <div className="grid grid-cols-3 gap-3">
                {[1, 2, 3, 4, 5, 6].map(pos => {
                  const p = plants.find(x => x.level === 1 && x.position === pos);
                  return (
                    <button key={pos} onClick={() => handlePlantAction(1, pos)} className={`aspect-square rounded-2xl flex flex-col items-center justify-center border-2 ${p ? `${VARIETY_CONFIG[p.variety]?.bg} border-white text-white` : 'bg-slate-50 border-dashed border-slate-200'}`}>
                      {p ? <Sprout /> : <Plus />}
                    </button>
                  );
                })}
              </div>
              <button disabled={plants.filter(p => p.level === 1).length < 6} onClick={() => setIsSetupComplete(true)} className="w-full bg-green-600 text-white p-6 rounded-[2rem] font-black shadow-xl disabled:opacity-20 uppercase">Finalizar</button>
            </div>
          )}
        </Card>
        {showPlantSelector && (
          <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[999] flex items-end p-4">
            <div className="bg-white w-full max-w-md mx-auto rounded-[3rem] p-8">
              {Object.keys(VARIETY_CONFIG).map(v => (
                <button key={v} onClick={() => { setPlants([...plants, {id: Date.now(), variety: v, level: showPlantSelector.lvl, position: showPlantSelector.pos}]); setShowPlantSelector(null); }} className={`w-full p-4 mb-2 rounded-2xl font-black text-left ${VARIETY_CONFIG[v].bg} text-white`}>{v}</button>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 pb-32 font-sans">
      <header className="bg-white border-b p-6 flex justify-between items-center sticky top-0 z-50">
        <div className="font-black text-green-600 text-2xl italic tracking-tighter">HydroCaru</div>
        <Badge className="bg-slate-900 text-white rounded-full font-black px-4">{params.waterVol}L / {initialVol}L</Badge>
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
            {/* RENDERIZADO FORZADO DE ALERTAS */}
            <div className="space-y-3">
              {alerts.length === 0 && (
                <Card className="p-6 rounded-[2.5rem] bg-green-50 text-green-700 border-2 border-green-100 flex items-center gap-4">
                   <div className="bg-green-600 p-2 rounded-full text-white"><Check className="w-6 h-6" /></div>
                   <p className="font-black uppercase text-xs">Todo en orden</p>
                </Card>
              )}
              {alerts.map((alert, idx) => (
                <Card key={idx} className={`${alert.color} text-white p-6 rounded-[2.5rem] flex items-center gap-6 shadow-lg border-none animate-in slide-in-from-top-4`}>
                  <div className="w-12 h-12 shrink-0">{alert.icon}</div>
                  <div>
                    <p className="text-[10px] font-black uppercase opacity-70 mb-1">{alert.title}</p>
                    <p className="text-3xl font-black leading-none">{alert.val}</p>
                    <p className="text-[10px] font-bold uppercase mt-1">{alert.desc}</p>
                  </div>
                </Card>
              ))}
            </div>

            <div className="grid grid-cols-2 gap-4 mt-6">
              <Card className="bg-white p-8 rounded-[2.5rem] border text-center">
                <p className="text-[10px] font-black text-slate-300 uppercase mb-1">pH</p>
                <p className="text-5xl font-black text-slate-800">{params.pH}</p>
              </Card>
              <Card className="bg-white p-8 rounded-[2.5rem] border text-center">
                <p className="text-[10px] font-black text-slate-300 uppercase mb-1">EC</p>
                <p className="text-5xl font-black text-slate-800">{params.ec}</p>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="measure">
            <Card className="p-8 rounded-[3rem] space-y-6 shadow-2xl">
              <div className="space-y-4">
                <div className="bg-slate-50 p-4 rounded-3xl border-2 font-black text-center">
                  <label className="text-[10px] text-slate-400 uppercase block mb-1">pH</label>
                  <input type="number" step="0.1" value={params.pH} onChange={e => setParams({...params, pH: e.target.value})} className="w-full bg-transparent text-4xl outline-none text-center" />
                </div>
                <div className="bg-slate-50 p-4 rounded-3xl border-2 font-black text-center">
                  <label className="text-[10px] text-slate-400 uppercase block mb-1">EC</label>
                  <input type="number" step="0.1" value={params.ec} onChange={e => setParams({...params, ec: e.target.value})} className="w-full bg-transparent text-4xl outline-none text-center" />
                </div>
                <div className="bg-blue-50 p-4 rounded-3xl border-2 border-blue-100 font-black text-center">
                  <label className="text-[10px] text-blue-400 uppercase block mb-1">Agua Actual (L)</label>
                  <input type="number" value={params.waterVol} onChange={e => setParams({...params, waterVol: e.target.value})} className="w-full bg-transparent text-4xl outline-none text-center text-blue-600" />
                </div>
                <button onClick={() => {
                   setHistory([{...params, id: Date.now(), date: new Date().toLocaleString()}, ...history]);
                   setActiveTab("overview");
                }} className="w-full bg-slate-900 text-white p-7 rounded-[2.5rem] font-black uppercase">Actualizar Panel</button>
              </div>
            </Card>
          </TabsContent>

          <TabsContent value="tower" className="space-y-2">
            {[1, 2, 3].map(lvl => (
              <div key={lvl} className="bg-white p-4 rounded-3xl border mb-4">
                <p className="text-[10px] font-black text-slate-400 uppercase text-center mb-3">Nivel {lvl}</p>
                <div className="grid grid-cols-3 gap-3">
                  {[1, 2, 3, 4, 5, 6].map(pos => {
                    const p = plants.find(x => x.level === lvl && x.position === pos);
                    return (
                      <button key={pos} onClick={() => handlePlantAction(lvl, pos)} className={`aspect-square rounded-2xl flex flex-col items-center justify-center border-2 ${p ? `${VARIETY_CONFIG[p.variety]?.bg} text-white` : 'bg-slate-50 border-dashed border-slate-200'}`}>
                        {p ? <Sprout /> : <Plus />}
                        {p && <span className="text-[6px] font-black uppercase mt-1">{p.variety.split(' ')[0]}</span>}
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}
          </TabsContent>

          <TabsContent value="calendar">
            <Card className="p-6 rounded-[2.5rem] bg-white border shadow-sm">
              <h3 className="font-black uppercase text-[10px] text-slate-400 mb-6 text-center">Puntos de Toma</h3>
              <div className="grid grid-cols-7 gap-1">
                {[0, 1, 2, 3, 4, 5, 6].map(i => {
                  const d = new Date(); d.setDate(d.getDate() + i);
                  return (
                    <div key={i} className={`flex flex-col items-center p-2 rounded-2xl ${i === 0 ? 'bg-green-600 text-white' : 'bg-slate-50 text-slate-400'}`}>
                      <span className="text-[8px] font-black uppercase mb-1">{d.toLocaleDateString('es-ES', { weekday: 'short' })}</span>
                      <span className="text-sm font-black mb-2">{d.getDate()}</span>
                      <div className="flex flex-col gap-1">
                        <div className={`w-1.5 h-1.5 rounded-full ${i === 0 ? 'bg-white' : 'bg-green-400'}`} />
                        <div className={`w-1.5 h-1.5 rounded-full ${i === 0 ? 'bg-white' : 'bg-green-400'}`} />
                      </div>
                    </div>
                  );
                })}
              </div>
            </Card>
          </TabsContent>
          
          <TabsContent value="history" className="space-y-3">
             {history.map(h => (
               <Card key={h.id} className="p-5 rounded-3xl bg-white border font-black">
                 <p className="text-[8px] text-slate-400 mb-1">{h.date}</p>
                 <div className="flex justify-between">
                   <span>pH {h.pH} | EC {h.ec}</span>
                   <Badge>{h.waterVol}L</Badge>
                 </div>
               </Card>
             ))}
          </TabsContent>

          <TabsContent value="settings" className="py-10 text-center">
             <button onClick={() => {localStorage.clear(); window.location.reload();}} className="w-full bg-red-100 text-red-600 p-8 rounded-[2.5rem] font-black uppercase text-xs border-2 border-red-200">Resetear Todo</button>
          </TabsContent>
        </Tabs>
      </main>

      {showPlantSelector && (
          <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[999] flex items-end p-4">
            <div className="bg-white w-full max-w-md mx-auto rounded-[3rem] p-8">
              {Object.keys(VARIETY_CONFIG).map(v => (
                <button key={v} onClick={() => { setPlants([...plants, {id: Date.now(), variety: v, level: showPlantSelector.lvl, position: showPlantSelector.pos}]); setShowPlantSelector(null); }} className={`w-full p-4 mb-2 rounded-2xl font-black text-left ${VARIETY_CONFIG[v].bg} text-white`}>{v}</button>
              ))}
            </div>
          </div>
        )}
    </div>
  );
}
