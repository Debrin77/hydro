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

  // Cargar datos al iniciar
  useEffect(() => {
    const saved = localStorage.getItem("hydroCaru_ULTIMATE_V32");
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

  // Guardar datos
  useEffect(() => {
    if (isSetupComplete) {
      localStorage.setItem("hydroCaru_ULTIMATE_V32", JSON.stringify({ isSetupComplete, plants, params, initialVol, history, lastRotation }));
    }
  }, [isSetupComplete, plants, params, initialVol, history, lastRotation]);

  // Alertas inteligentes
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
      const water = (vol * (ec - targetEC)) / targetEC;
      res.push({ title: 'EC ALTA', val: water.toFixed(1) + ' L', desc: 'Añadir AGUA LIMPIA', color: 'bg-cyan-500', icon: <Droplets /> });
    } else if (ec < targetEC && ec > 0) {
      const nuts = ((targetEC - ec) / 0.1) * vol * 0.25;
      res.push({ title: 'EC BAJA', val: nuts.toFixed(1) + ' ml', desc: `Nutrientes A+B`, color: 'bg-blue-600', icon: <FlaskConical /> });
    }

    if (temp > 25) res.push({ title: 'TEMP ALTA', val: `${temp}°C`, desc: 'Enfriar depósito', color: 'bg-red-600', icon: <Thermometer /> });
    
    return { alerts: res };
  }, [params, initialVol]);

  // UI Niveles
  const renderLevelUI = (lvl: number) => (
    <div className="bg-slate-50 p-4 rounded-3xl border-2 border-dashed border-slate-200">
      <div className="grid grid-cols-3 gap-3">
        {[1, 2, 3, 4, 5, 6].map(pos => {
          const p = plants.find(x => x.level === lvl && x.position === pos);
          return (
            <button key={pos} onClick={() => {
              const exists = plants.find(x => x.level === lvl && x.position === pos);
              if (exists) setPlants(plants.filter(x => x.id !== exists.id));
              else setShowPlantSelector({ lvl, pos });
            }} className={`aspect-square rounded-2xl flex flex-col items-center justify-center border-2 transition-all ${p ? `${VARIETY_CONFIG[p.variety]?.bg} border-white text-white shadow-lg` : 'bg-white border-slate-200 text-slate-300'}`}>
              {p ? <Sprout className="w-6 h-6" /> : <Plus className="w-5 h-5" />}
              {p && <span className="text-[6px] font-black uppercase mt-1 leading-none">{p.variety.split(' ')[0]}</span>}
            </button>
          );
        })}
      </div>
    </div>
  );

  // --- FLUJO DE INICIO (SETUP) ---
  if (!isSetupComplete) {
    return (
      <div className="min-h-screen bg-slate-100 flex items-center justify-center p-4">
        <Card className="w-full max-w-md p-8 bg-white rounded-[3rem] shadow-2xl overflow-hidden relative border-none">
          <div className="absolute top-0 left-0 w-full h-2 bg-slate-100"><div className="h-full bg-green-500 transition-all" style={{ width: `${(setupStep / 3) * 100}%` }} /></div>
          <h2 className="text-3xl font-black italic text-green-600 text-center mb-8 uppercase tracking-tighter">HydroCaru</h2>
          
          {setupStep === 1 && (
            <div className="space-y-6 animate-in slide-in-from-bottom">
              <div className="text-center"><span className="text-[10px] text-slate-400 font-black uppercase">1. Volumen de Agua</span><h3 className="text-xl font-black mb-4">¿Capacidad del depósito (L)?</h3><input type="number" value={initialVol} onChange={e => {setInitialVol(e.target.value); setParams({...params, waterVol: e.target.value})}} className="w-full bg-slate-50 rounded-3xl p-6 text-5xl font-black text-center border-2 border-green-50 outline-none" /></div>
              <button onClick={() => setSetupStep(2)} className="w-full bg-slate-900 text-white p-6 rounded-[2rem] font-black uppercase">Siguiente</button>
            </div>
          )}

          {setupStep === 2 && (
            <div className="space-y-6 animate-in slide-in-from-right">
              <div className="text-center"><span className="text-[10px] text-slate-400 font-black uppercase">2. Primera Plantación</span><h3 className="text-xl font-black mb-4">Añade al Nivel 1</h3>{renderLevelUI(1)}</div>
              <button disabled={plants.length === 0} onClick={() => setSetupStep(3)} className="w-full bg-slate-900 text-white p-6 rounded-[2rem] font-black uppercase disabled:opacity-20">Siguiente</button>
            </div>
          )}

          {setupStep === 3 && (
            <div className="space-y-6 animate-in slide-in-from-right text-center">
              <span className="text-[10px] text-slate-400 font-black uppercase">3. Ajustes Finales</span><h3 className="text-xl font-black mb-4">Condiciones Actuales</h3>
              <div className="space-y-3">
                <div className="bg-blue-600 p-4 rounded-3xl text-white"><label className="text-[8px] font-black uppercase block mb-1">Objetivo EC Manual</label><input type="number" step="0.1" value={params.manualTargetEC} onChange={e => setParams({...params, manualTargetEC: e.target.value})} className="w-full bg-transparent text-3xl font-black text-center outline-none" /></div>
                <div className="bg-orange-500 p-4 rounded-3xl text-white"><label className="text-[8px] font-black uppercase block mb-1">Temperatura °C</label><input type="number" value={params.temp} onChange={e => setParams({...params, temp: e.target.value})} className="w-full bg-transparent text-3xl font-black text-center outline-none" /></div>
              </div>
              <button onClick={() => setIsSetupComplete(true)} className="w-full bg-green-600 text-white p-6 rounded-[2rem] font-black uppercase shadow-xl animate-pulse">Iniciar Sistema</button>
            </div>
          )}
        </Card>
        {showPlantSelector && (
          <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[999] flex items-end p-4">
            <div className="bg-white w-full max-w-md mx-auto rounded-[3.5rem] p-10 shadow-2xl">
              {Object.keys(VARIETY_CONFIG).map(v => ( <button key={v} onClick={() => { setPlants([...plants, {id: Date.now(), variety: v, level: showPlantSelector.lvl, position: showPlantSelector.pos}]); setShowPlantSelector(null); }} className={`w-full p-5 mb-3 rounded-2xl font-black text-left ${VARIETY_CONFIG[v].bg} text-white`}>{v}</button> ))}
              <button onClick={() => setShowPlantSelector(null)} className="w-full mt-4 p-2 text-slate-400 font-bold uppercase text-[10px]">Cerrar</button>
            </div>
          </div>
        )}
      </div>
    );
  }

  // --- PANEL PRINCIPAL ---
  return (
    <div className="min-h-screen bg-slate-50 pb-32 font-sans text-slate-900">
      <header className="bg-white border-b p-6 flex justify-between items-center sticky top-0 z-50">
        <div className="font-black text-green-600 text-2xl italic tracking-tighter">HydroCaru</div>
        <div className="flex gap-2">
           <Badge className="bg-blue-600 text-white border-none font-black px-3">{params.manualTargetEC} OBJ</Badge>
           <Badge className={`border-none font-black px-3 ${parseFloat(params.temp) > 25 ? 'bg-red-500 text-white' : 'bg-slate-900 text-white'}`}>{params.temp}°C</Badge>
        </div>
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

          <TabsContent value="overview" className="space-y-4 animate-in fade-in">
            {systemStatus.alerts.map((alert, i) => (
              <Card key={i} className={`${alert.color} text-white p-6 rounded-[2.5rem] flex items-center gap-6 shadow-lg border-none`}>
                <div className="w-10 h-10">{alert.icon}</div>
                <div><p className="text-[10px] font-black uppercase opacity-70 mb-1">{alert.title}</p><p className="text-3xl font-black leading-none">{alert.val}</p><p className="text-[10px] font-bold uppercase mt-1">{alert.desc}</p></div>
              </Card>
            ))}
            {systemStatus.alerts.length === 0 && (
              <Card className="p-8 rounded-[2.5rem] bg-green-50 text-green-700 border-2 border-green-100 flex items-center justify-center gap-4">
                 <Check className="w-8 h-8" /> <span className="font-black uppercase tracking-widest text-sm">Sistema en Orden</span>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="measure">
            <Card className="p-8 rounded-[3rem] space-y-4 shadow-2xl bg-white">
              <div className="space-y-4 font-black">
                <div className="bg-blue-600 p-5 rounded-3xl text-white text-center shadow-inner">
                  <label className="text-[9px] uppercase block mb-1 font-black opacity-80 tracking-widest">Ajustar Objetivo EC</label>
                  <input type="number" step="0.1" value={params.manualTargetEC} onChange={e => setParams({...params, manualTargetEC: e.target.value})} className="w-full bg-transparent text-4xl outline-none text-center font-black" />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-slate-50 p-4 rounded-3xl border-2 text-center"><label className="text-[8px] text-slate-400 uppercase block mb-1">pH</label><input type="number" step="0.1" value={params.pH} onChange={e => setParams({...params, pH: e.target.value})} className="w-full bg-transparent text-2xl outline-none text-center" /></div>
                  <div className="bg-slate-50 p-4 rounded-3xl border-2 text-center"><label className="text-[8px] text-slate-400 uppercase block mb-1">EC</label><input type="number" step="0.1" value={params.ec} onChange={e => setParams({...params, ec: e.target.value})} className="w-full bg-transparent text-2xl outline-none text-center" /></div>
                  <div className="bg-orange-50 p-4 rounded-3xl border-2 border-orange-100 text-center text-orange-600"><label className="text-[8px] text-orange-400 uppercase block mb-1">Temp °C</label><input type="number" value={params.temp} onChange={e => setParams({...params, temp: e.target.value})} className="w-full bg-transparent text-2xl outline-none text-center" /></div>
                  <div className="bg-cyan-50 p-4 rounded-3xl border-2 border-cyan-100 text-center text-cyan-600"><label className="text-[8px] text-cyan-400 uppercase block mb-1">Agua (L)</label><input type="number" value={params.waterVol} onChange={e => setParams({...params, waterVol: e.target.value})} className="w-full bg-transparent text-2xl outline-none text-center" /></div>
                </div>
                <button onClick={() => { setHistory([{...params, id: Date.now(), date: new Date().toLocaleString()}, ...history]); setActiveTab("overview"); }} className="w-full bg-slate-900 text-white p-6 rounded-[2rem] font-black uppercase mt-4">Guardar Registro</button>
              </div>
            </Card>
          </TabsContent>

          <TabsContent value="tower">
            {[1, 2, 3].map(lvl => (
              <div key={lvl} className="mb-6"><p className="text-[10px] font-black text-slate-400 uppercase mb-2 ml-2 tracking-widest">Nivel {lvl}</p>{renderLevelUI(lvl)}</div>
            ))}
          </TabsContent>

          <TabsContent value="calendar" className="space-y-4">
             <Card className="p-8 rounded-[2.5rem] bg-slate-900 text-white text-center">
                <p className="text-[10px] font-black uppercase text-slate-500 mb-2 tracking-widest">Próxima Limpieza/Rotación</p>
                <p className="text-4xl font-black italic tracking-tighter">{new Date(new Date(lastRotation).getTime() + 14 * 86400000).toLocaleDateString()}</p>
                <button onClick={() => setLastRotation(new Date().toISOString())} className="mt-4 text-[8px] bg-red-600 px-6 py-2 rounded-full font-black uppercase tracking-widest shadow-lg animate-pulse">Rotación hecha hoy</button>
             </Card>
             <Card className="p-6 rounded-[2.5rem] bg-white border-2">
                <div className="grid grid-cols-7 gap-2">
                  {['L','M','X','J','V','S','D'].map(d => <div key={d} className="text-center text-[10px] font-black text-slate-300">{d}</div>)}
                  {Array.from({length: 31}).map((_, i) => {
                    const day = i + 1;
                    const date = new Date(new Date().getFullYear(), new Date().getMonth(), day);
                    const dayOfWeek = date.getDay(); // 1=Lunes, 3=Miércoles, 5=Viernes
                    const isMeasureDay = [1, 3, 5].includes(dayOfWeek);
                    const isRotationDay = new Date(new Date(lastRotation).getTime() + 14 * 86400000).getDate() === day;
                    const hasDone = history.some(h => new Date(h.date).getDate() === day);

                    return (
                      <div key={i} className={`aspect-square flex flex-col items-center justify-center rounded-xl text-xs font-black relative ${hasDone ? 'bg-green-500 text-white' : 'bg-slate-50 text-slate-400'}`}>
                        {day}
                        <div className="flex gap-0.5 mt-0.5">
                          {isMeasureDay && !hasDone && <div className="w-1 h-1 rounded-full bg-blue-500"></div>}
                          {isRotationDay && <div className="w-1 h-1 rounded-full bg-red-500 animate-ping"></div>}
                        </div>
                      </div>
                    )
                  })}
                </div>
             </Card>
          </TabsContent>

          <TabsContent value="history" className="space-y-3">
             {history.map(h => (
                <Card key={h.id} className="p-4 rounded-[2rem] bg-white border-2 font-black shadow-sm flex flex-col gap-2">
                  <p className="text-[8px] text-slate-400 uppercase tracking-widest">{h.date}</p>
                  <div className="flex justify-between items-center text-[10px] text-slate-700">
                    <span className="flex items-center gap-1"><Gauge className="w-3 h-3"/> {h.pH} | {h.ec}</span>
                    <span className="flex items-center gap-1 text-orange-500"><Thermometer className="w-3 h-3"/> {h.temp}°C</span>
                    <span className="flex items-center gap-1 text-blue-600"><Droplets className="w-3 h-3"/> {h.waterVol}L</span>
                  </div>
                </Card>
             ))}
          </TabsContent>

          <TabsContent value="settings" className="py-10">
             <button onClick={() => {if(confirm('¿BORRAR TODO?')) {localStorage.removeItem("hydroCaru_ULTIMATE_V32"); window.location.reload();}}} className="w-full bg-red-100 text-red-600 p-8 rounded-[3rem] font-black uppercase text-xs tracking-widest border-2 border-red-200">Reset de Fábrica</button>
          </TabsContent>
        </Tabs>
      </main>

      {showPlantSelector && (
          <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[999] flex items-end p-4">
            <div className="bg-white w-full max-w-md mx-auto rounded-[3.5rem] p-10 shadow-2xl">
              {Object.keys(VARIETY_CONFIG).map(v => ( <button key={v} onClick={() => { setPlants([...plants, {id: Date.now(), variety: v, level: showPlantSelector.lvl, position: showPlantSelector.pos}]); setShowPlantSelector(null); }} className={`w-full p-5 mb-3 rounded-2xl font-black text-left ${VARIETY_CONFIG[v].bg} text-white`}>{v}</button> ))}
              <button onClick={() => setShowPlantSelector(null)} className="w-full mt-4 p-2 text-slate-400 font-bold uppercase text-[10px]">Cerrar</button>
            </div>
          </div>
      )}
    </div>
  );
}
