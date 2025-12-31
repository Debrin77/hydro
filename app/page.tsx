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
  const [activeTab, setActiveTab] = useState("overview");
  const [plants, setPlants] = useState<any[]>([]);
  const [history, setHistory] = useState<any[]>([]);
  const [lastRotation, setLastRotation] = useState<string>(new Date().toISOString());
  const [showPlantSelector, setShowPlantSelector] = useState<{lvl: number, pos: number} | null>(null);
  const [initialVol, setInitialVol] = useState("20");
  
  // Estados de medición
  const [params, setParams] = useState({ 
    pH: "6.0", 
    ec: "1.2", 
    waterVol: "20", 
    temp: "20",
    manualTargetEC: "1.2" // Nuevo: Control manual
  });

  useEffect(() => {
    const saved = localStorage.getItem("hydroCaru_Ultra_V28");
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
      localStorage.setItem("hydroCaru_Ultra_V28", JSON.stringify({ isSetupComplete, plants, params, initialVol, history, lastRotation }));
    }
  }, [isSetupComplete, plants, params, initialVol, history, lastRotation]);

  // --- LÓGICA DE ALERTAS Y OBJETIVOS MEJORADA ---
  const systemStatus = useMemo(() => {
    const ph = parseFloat(params.pH) || 0;
    const ec = parseFloat(params.ec) || 0;
    const vol = parseFloat(params.waterVol) || 0;
    const temp = parseFloat(params.temp) || 0;
    const targetEC = parseFloat(params.manualTargetEC) || 1.2;

    const res = [];
    
    // Alertas pH
    if (ph > 6.2) res.push({ title: 'pH ALTO', val: ((ph - 6.0) * vol * 0.1).toFixed(1) + ' ml', desc: 'Añadir pH DOWN', color: 'bg-purple-600', icon: <ArrowDownCircle /> });
    else if (ph < 5.8 && ph > 0) res.push({ title: 'pH BAJO', val: ((6.0 - ph) * vol * 0.1).toFixed(1) + ' ml', desc: 'Añadir pH UP', color: 'bg-orange-500', icon: <ArrowDownCircle className="rotate-180" /> });

    // Alertas EC (basadas en el objetivo manual)
    if (ec > (targetEC + 0.1)) {
      const waterToAdd = (vol * (ec - targetEC)) / targetEC;
      res.push({ title: 'EC ALTA', val: waterToAdd.toFixed(1) + ' L', desc: 'Añadir AGUA LIMPIA', color: 'bg-cyan-500', icon: <Droplets /> });
    } else if (ec < targetEC && ec > 0) {
      const nutsToAdd = ((targetEC - ec) / 0.1) * vol * 0.25;
      res.push({ title: 'EC BAJA', val: nutsToAdd.toFixed(1) + ' ml', desc: `Añadir A+B para llegar a ${targetEC}`, color: 'bg-blue-600', icon: <FlaskConical /> });
    }

    // Alertas Temperatura (Crucial para raíces)
    if (temp > 25) res.push({ title: 'AGUA CALIENTE', val: `${temp}°C`, desc: 'Peligro de Pythium. Añadir hielo o enfriar.', color: 'bg-red-600', icon: <Thermometer /> });
    else if (temp < 16 && temp > 0) res.push({ title: 'AGUA FRÍA', val: `${temp}°C`, desc: 'Crecimiento lento.', color: 'bg-blue-400', icon: <Thermometer /> });

    if (vol < (parseFloat(initialVol) * 0.5)) res.push({ title: 'NIVEL AGUA', val: 'BAJO', desc: `Rellenar depósito`, color: 'bg-amber-600', icon: <AlertCircle /> });
    
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
          <div className="space-y-6">
            <div className="bg-slate-50 p-6 rounded-[2rem] border-2 text-center">
              <span className="text-[10px] text-slate-400 font-black uppercase tracking-widest">Litros Iniciales</span>
              <input type="number" value={initialVol} onChange={e => {setInitialVol(e.target.value); setParams({...params, waterVol: e.target.value})}} className="w-full bg-transparent text-5xl font-black outline-none mt-2 text-center" />
            </div>
            <button onClick={() => setIsSetupComplete(true)} className="w-full bg-slate-900 text-white p-6 rounded-[2rem] font-black uppercase tracking-widest">Empezar</button>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 pb-32 font-sans">
      <header className="bg-white border-b p-6 flex justify-between items-center sticky top-0 z-50">
        <div className="font-black text-green-600 text-2xl italic tracking-tighter">HydroCaru</div>
        <div className="flex gap-2">
           <Badge className="bg-blue-600 text-white border-none font-black">{params.manualTargetEC} OBJ</Badge>
           <Badge className="bg-slate-900 text-white border-none font-black">{params.temp}°C</Badge>
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
            <div className="space-y-3">
              {systemStatus.alerts.map((alert, i) => (
                <Card key={i} className={`${alert.color} text-white p-6 rounded-[2.5rem] flex items-center gap-6 shadow-lg border-none animate-in slide-in-from-right`}>
                  <div className="w-10 h-10">{alert.icon}</div>
                  <div><p className="text-[10px] font-black uppercase opacity-70 mb-1">{alert.title}</p><p className="text-3xl font-black leading-none">{alert.val}</p><p className="text-[10px] font-bold uppercase mt-1">{alert.desc}</p></div>
                </Card>
              ))}
              {systemStatus.alerts.length === 0 && (
                <Card className="p-6 rounded-[2.5rem] bg-green-50 text-green-700 border-2 border-green-100 flex items-center gap-4">
                   <Check className="w-6 h-6" /> <p className="font-black uppercase text-xs tracking-widest">Todo correcto</p>
                </Card>
              )}
            </div>
            
            <div className="grid grid-cols-2 gap-4 mt-4">
              <Card className="bg-white p-6 rounded-[2rem] border text-center">
                <p className="text-[10px] font-black text-slate-300 uppercase mb-1">pH</p>
                <p className="text-4xl font-black text-slate-800">{params.pH}</p>
              </Card>
              <Card className="bg-white p-6 rounded-[2rem] border text-center">
                <p className="text-[10px] font-black text-slate-300 uppercase mb-1">Agua</p>
                <p className="text-4xl font-black text-blue-600">{params.waterVol}L</p>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="measure">
            <Card className="p-8 rounded-[3rem] space-y-4 shadow-2xl">
              <div className="space-y-3 font-black">
                {/* Selector de Objetivo EC Manual */}
                <div className="bg-blue-600 p-4 rounded-3xl text-white text-center shadow-lg">
                  <label className="text-[10px] uppercase block mb-1 opacity-80 italic">Objetivo EC Manual (Protección Raíces)</label>
                  <input type="number" step="0.1" value={params.manualTargetEC} onChange={e => setParams({...params, manualTargetEC: e.target.value})} className="w-full bg-transparent text-4xl outline-none text-center font-black" />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-slate-50 p-4 rounded-3xl border-2 text-center"><label className="text-[10px] text-slate-400 uppercase block mb-1 text-[8px]">pH Medido</label><input type="number" step="0.1" value={params.pH} onChange={e => setParams({...params, pH: e.target.value})} className="w-full bg-transparent text-2xl outline-none text-center" /></div>
                  <div className="bg-slate-50 p-4 rounded-3xl border-2 text-center"><label className="text-[10px] text-slate-400 uppercase block mb-1 text-[8px]">EC Medida</label><input type="number" step="0.1" value={params.ec} onChange={e => setParams({...params, ec: e.target.value})} className="w-full bg-transparent text-2xl outline-none text-center" /></div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-orange-50 p-4 rounded-3xl border-2 border-orange-100 text-center"><label className="text-[10px] text-orange-400 uppercase block mb-1 text-[8px]">Temp Agua °C</label><input type="number" value={params.temp} onChange={e => setParams({...params, temp: e.target.value})} className="w-full bg-transparent text-2xl outline-none text-center text-orange-600" /></div>
                  <div className="bg-cyan-50 p-4 rounded-3xl border-2 border-cyan-100 text-center"><label className="text-[10px] text-cyan-400 uppercase block mb-1 text-[8px]">Volumen (L)</label><input type="number" value={params.waterVol} onChange={e => setParams({...params, waterVol: e.target.value})} className="w-full bg-transparent text-2xl outline-none text-center text-cyan-600" /></div>
                </div>

                <button onClick={() => { setHistory([{...params, id: Date.now(), date: new Date().toLocaleString()}, ...history]); setActiveTab("overview"); }} className="w-full bg-slate-900 text-white p-6 rounded-[2rem] font-black uppercase mt-4">Guardar y Analizar</button>
              </div>
            </Card>
          </TabsContent>

          <TabsContent value="tower">
            {[1, 2, 3].map(lvl => renderLevelUI(lvl))}
          </TabsContent>

          <TabsContent value="calendar" className="space-y-4">
             <Card className="p-6 rounded-[2.5rem] bg-white border">
                <p className="text-[10px] font-black uppercase text-slate-400 mb-4 text-center tracking-widest italic">Plan de Mantenimiento</p>
                <div className="grid grid-cols-7 gap-2">
                  {['L','M','X','J','V','S','D'].map(d => <div key={d} className="text-center text-[10px] font-black text-slate-300">{d}</div>)}
                  {Array.from({length: 31}).map((_, i) => {
                    const day = i + 1;
                    const date = new Date(new Date().getFullYear(), new Date().getMonth(), day);
                    const dayOfWeek = date.getDay();
                    const isMeasureDay = [1, 3, 5].includes(dayOfWeek);
                    const hasDone = history.some(h => new Date(h.date).getDate() === day);
                    return (
                      <div key={i} className={`aspect-square flex flex-col items-center justify-center rounded-xl text-xs font-black relative ${hasDone ? 'bg-green-500 text-white' : 'bg-slate-50 text-slate-400'}`}>
                        {day}
                        {isMeasureDay && !hasDone && <div className="absolute bottom-1 w-1 h-1 rounded-full bg-blue-500"></div>}
                      </div>
                    )
                  })}
                </div>
             </Card>
          </TabsContent>

          <TabsContent value="history" className="space-y-3">
             {history.map(h => (
                <Card key={h.id} className="p-4 rounded-[2rem] bg-white border font-black shadow-sm">
                  <p className="text-[7px] text-slate-400 mb-2 uppercase tracking-tighter">{h.date}</p>
                  <div className="grid grid-cols-2 gap-2 text-[11px]">
                    <div className="flex items-center gap-1 text-slate-700"><Gauge className="w-3 h-3 text-blue-500"/> pH {h.pH} | EC {h.ec}</div>
                    <div className="flex items-center gap-1 text-slate-700"><Thermometer className="w-3 h-3 text-orange-500"/> {h.temp}°C</div>
                    <div className="flex items-center gap-1 text-slate-700"><Droplets className="w-3 h-3 text-cyan-500"/> {h.waterVol}L (Obj: {h.manualTargetEC})</div>
                  </div>
                </Card>
             ))}
          </TabsContent>

          <TabsContent value="settings" className="py-10">
             <button onClick={() => {if(confirm('¿BORRAR HISTORIAL Y DATOS?')) {localStorage.clear(); window.location.reload();}}} className="w-full bg-red-100 text-red-600 p-8 rounded-[2.5rem] font-black uppercase text-xs">Reset Total</button>
          </TabsContent>
        </Tabs>
      </main>

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
