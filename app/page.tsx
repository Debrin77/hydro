"use client"

import React, { useState, useEffect, useMemo } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { 
  Sprout, Activity, Layers, Beaker, Calendar as CalendarIcon, 
  History, Plus, Trash2, FlaskConical, 
  ArrowDownCircle, RefreshCw, Droplets, AlertCircle, Check
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
    const saved = localStorage.getItem("hydroCaru_Final_V26");
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
      localStorage.setItem("hydroCaru_Final_V26", JSON.stringify({ isSetupComplete, plants, params, initialVol, history, lastRotation }));
    }
  }, [isSetupComplete, plants, params, initialVol, history, lastRotation]);

  const alerts = useMemo(() => {
    const ph = parseFloat(params.pH) || 0;
    const ec = parseFloat(params.ec) || 0;
    const vol = parseFloat(params.waterVol) || 0;
    const target = plants.length > 12 ? 1.6 : plants.length > 6 ? 1.4 : 1.2;
    const res = [];

    if (ph > 6.2) res.push({ title: 'pH ALTO', val: ((ph - 6.0) * vol * 0.1).toFixed(1) + ' ml', desc: 'Añadir pH DOWN', color: 'bg-purple-600', icon: <ArrowDownCircle /> });
    else if (ph < 5.8 && ph > 0) res.push({ title: 'pH BAJO', val: ((6.0 - ph) * vol * 0.1).toFixed(1) + ' ml', desc: 'Añadir pH UP', color: 'bg-orange-500', icon: <ArrowDownCircle className="rotate-180" /> });

    if (ec > (target + 0.1)) {
      const water = (vol * (ec - target)) / target;
      res.push({ title: 'EC ALTA', val: water.toFixed(1) + ' L', desc: 'Añadir AGUA LIMPIA', color: 'bg-cyan-500', icon: <Droplets /> });
    } else if (ec < target && ec > 0) {
      const nuts = ((target - ec) / 0.1) * vol * 0.25;
      res.push({ title: 'EC BAJA', val: nuts.toFixed(1) + ' ml', desc: 'Añadir NUTRIENTES (A+B)', color: 'bg-blue-600', icon: <FlaskConical /> });
    }

    if (vol < (parseFloat(initialVol) * 0.5)) res.push({ title: 'AGUA BAJA', val: 'RELLENAR', desc: `Nivel crítico: ${vol}L`, color: 'bg-amber-500', icon: <AlertCircle /> });
    
    return res;
  }, [params, initialVol, plants.length]);

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
        <Card className="w-full max-w-md p-8 bg-white rounded-[3rem] shadow-2xl">
          <h2 className="text-3xl font-black italic text-green-600 text-center mb-8 uppercase tracking-tighter">HydroCaru</h2>
          {setupStep === 1 ? (
            <div className="space-y-6">
              <div className="bg-slate-50 p-6 rounded-[2rem] border-2">
                <span className="text-[10px] text-slate-400 font-black uppercase">Capacidad Depósito (L)</span>
                <input type="number" value={initialVol} onChange={e => {setInitialVol(e.target.value); setParams({...params, waterVol: e.target.value})}} className="w-full bg-transparent text-4xl font-black outline-none mt-2" />
              </div>
              <button onClick={() => setSetupStep(2)} className="w-full bg-slate-900 text-white p-6 rounded-[2rem] font-black uppercase">Siguiente</button>
            </div>
          ) : (
            <div className="space-y-6">
              <p className="text-center text-slate-400 font-bold uppercase text-[10px]">Paso 2: Rellena el Nivel 1</p>
              {renderLevelUI(1)}
              <button disabled={plants.filter(p => p.level === 1).length < 6} onClick={() => setIsSetupComplete(true)} className="w-full bg-green-600 text-white p-6 rounded-[2rem] font-black shadow-xl disabled:opacity-20 uppercase">Comenzar</button>
            </div>
          )}
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 pb-32 font-sans">
      <header className="bg-white border-b p-6 flex justify-between items-center sticky top-0 z-50 shadow-sm">
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
            <div className="space-y-3">
              {alerts.length === 0 ? (
                <Card className="p-6 rounded-[2.5rem] bg-green-50 text-green-700 border-2 border-green-100 flex items-center gap-4">
                   <Check className="w-6 h-6" /> <p className="font-black uppercase text-xs tracking-widest">Niveles Perfectos</p>
                </Card>
              ) : (
                alerts.map((alert, i) => (
                  <Card key={i} className={`${alert.color} text-white p-6 rounded-[2.5rem] flex items-center gap-6 shadow-lg border-none`}>
                    <div className="w-10 h-10">{alert.icon}</div>
                    <div><p className="text-[10px] font-black uppercase opacity-70 leading-none mb-1">{alert.title}</p><p className="text-3xl font-black leading-none">{alert.val}</p><p className="text-[10px] font-bold uppercase mt-1">{alert.desc}</p></div>
                  </Card>
                ))
              )}
            </div>

            <div className="grid grid-cols-2 gap-4 mt-6">
              <Card className="bg-white p-8 rounded-[2.5rem] border text-center shadow-sm">
                <p className="text-[10px] font-black text-slate-300 uppercase mb-1">pH</p>
                <p className={`text-5xl font-black ${parseFloat(params.pH) > 6.2 || parseFloat(params.pH) < 5.8 ? 'text-red-500' : 'text-slate-800'}`}>{params.pH}</p>
              </Card>
              <Card className="bg-white p-8 rounded-[2.5rem] border text-center shadow-sm">
                <p className="text-[10px] font-black text-slate-300 uppercase mb-1">EC</p>
                <p className="text-5xl font-black text-slate-800">{params.ec}</p>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="measure">
            <Card className="p-8 rounded-[3rem] space-y-6 shadow-2xl border-none">
              <div className="space-y-4 font-black">
                <div className="bg-slate-50 p-4 rounded-3xl border-2 text-center"><label className="text-[10px] text-slate-400 uppercase block mb-1">pH Medido</label><input type="number" step="0.1" value={params.pH} onChange={e => setParams({...params, pH: e.target.value})} className="w-full bg-transparent text-4xl outline-none text-center" /></div>
                <div className="bg-slate-50 p-4 rounded-3xl border-2 text-center"><label className="text-[10px] text-slate-400 uppercase block mb-1">EC Medida</label><input type="number" step="0.1" value={params.ec} onChange={e => setParams({...params, ec: e.target.value})} className="w-full bg-transparent text-4xl outline-none text-center" /></div>
                <div className="bg-blue-50 p-4 rounded-3xl border-2 border-blue-100 text-center"><label className="text-[10px] text-blue-400 uppercase block mb-1">Agua en Tanque (L)</label><input type="number" value={params.waterVol} onChange={e => setParams({...params, waterVol: e.target.value})} className="w-full bg-transparent text-4xl outline-none text-center text-blue-600" /></div>
                <button onClick={() => { setHistory([{...params, id: Date.now(), date: new Date().toLocaleString()}, ...history]); setActiveTab("overview"); }} className="w-full bg-slate-900 text-white p-7 rounded-[2.5rem] font-black uppercase">Guardar Cambios</button>
              </div>
            </Card>
          </TabsContent>

          <TabsContent value="tower" className="space-y-2">
            {[1, 2, 3].map(lvl => renderLevelUI(lvl))}
          </TabsContent>

          <TabsContent value="calendar" className="space-y-4">
             <Card className="p-8 rounded-[2.5rem] bg-slate-900 text-white text-center">
                <p className="text-[10px] font-black uppercase text-slate-500 mb-2">Próxima Rotación</p>
                <p className="text-4xl font-black tracking-tighter italic">{new Date(new Date(lastRotation).getTime() + 14 * 86400000).toLocaleDateString()}</p>
                <button onClick={() => setLastRotation(new Date().toISOString())} className="mt-4 text-[10px] bg-white/10 px-4 py-2 rounded-full font-bold uppercase">Reiniciar Ciclo Hoy</button>
             </Card>

             <Card className="p-6 rounded-[2.5rem] bg-white border">
                <p className="text-[10px] font-black uppercase text-slate-400 mb-4 text-center tracking-widest">Días con Mediciones</p>
                <div className="grid grid-cols-7 gap-2">
                  {['L','M','X','J','V','S','D'].map(d => <div key={d} className="text-center text-[10px] font-black text-slate-300">{d}</div>)}
                  {Array.from({length: 31}).map((_, i) => {
                    const day = i + 1;
                    const hasData = history.some(h => new Date(h.date).getDate() === day);
                    return (
                      <div key={i} className={`aspect-square flex items-center justify-center rounded-xl text-xs font-black ${hasData ? 'bg-green-500 text-white shadow-md' : 'bg-slate-50 text-slate-400'}`}>
                        {day}
                      </div>
                    )
                  })}
                </div>
             </Card>
          </TabsContent>

          <TabsContent value="history" className="space-y-3">
             {history.length === 0 ? (
               <div className="text-center py-10 text-slate-400 font-bold uppercase text-xs">Sin registros aún</div>
             ) : (
               history.map(h => (
                <Card key={h.id} className="p-5 rounded-3xl bg-white border font-black shadow-sm">
                  <p className="text-[8px] text-slate-400 mb-1 tracking-widest uppercase">{h.date}</p>
                  <div className="flex justify-between items-center">
                    <span className="text-slate-800">pH {h.pH} | EC {h.ec}</span>
                    <Badge className="bg-blue-50 text-blue-600 border-none px-3">{h.waterVol}L</Badge>
                  </div>
                </Card>
               ))
             )}
          </TabsContent>

          <TabsContent value="settings" className="py-10">
             <button onClick={() => {if(confirm('¿BORRAR TODO?')) {localStorage.clear(); window.location.reload();}}} className="w-full bg-red-100 text-red-600 p-8 rounded-[2.5rem] font-black uppercase text-xs tracking-widest">Reset Total de Datos</button>
          </TabsContent>
        </Tabs>
      </main>

      {showPlantSelector && (
          <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[999] flex items-end p-4">
            <div className="bg-white w-full max-w-md mx-auto rounded-[3rem] p-8">
              <h3 className="font-black text-center text-xs uppercase mb-4 text-slate-400">Seleccionar Variedad</h3>
              <div className="grid grid-cols-1 gap-2">
                {Object.keys(VARIETY_CONFIG).map(v => (
                  <button key={v} onClick={() => { setPlants([...plants, {id: Date.now(), variety: v, level: showPlantSelector.lvl, position: showPlantSelector.pos}]); setShowPlantSelector(null); }} className={`w-full p-5 rounded-2xl font-black text-left ${VARIETY_CONFIG[v].bg} text-white shadow-sm`}>{v}</button>
                ))}
              </div>
              <button onClick={() => setShowPlantSelector(null)} className="w-full mt-4 p-4 text-slate-400 font-black uppercase text-xs">Cancelar</button>
            </div>
          </div>
      )}
    </div>
  );
}
