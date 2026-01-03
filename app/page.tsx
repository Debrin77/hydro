"use client"

import React, { useState, useEffect, useMemo } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { 
  Sprout, Activity, Layers, Beaker, Calendar as CalendarIcon, 
  Plus, Trash2, FlaskConical, ArrowDownCircle, Droplets, 
  Check, Lock, Lightbulb, AlertTriangle, Thermometer, Zap, Info, Scissors, Clock
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
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [pinInput, setPinInput] = useState("");
  const MASTER_PIN = "1234"; 

  const [isSetupComplete, setIsSetupComplete] = useState(false);
  const [setupStep, setSetupStep] = useState(1);
  const [activeTab, setActiveTab] = useState("overview");
  const [plants, setPlants] = useState<any[]>([]);
  const [history, setHistory] = useState<any[]>([]);
  const [lastRotation, setLastRotation] = useState<string>(new Date().toISOString());
  const [showPlantSelector, setShowPlantSelector] = useState<{lvl: number, pos: number} | null>(null);
  const [initialVol, setInitialVol] = useState("20");
  const [params, setParams] = useState({ 
    pH: "6.0", ec: "1.2", waterVol: "20", temp: "22", manualTargetEC: "1.4" 
  });

  useEffect(() => {
    const saved = localStorage.getItem("hydroCaru_V13_CALENDAR");
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
      localStorage.setItem("hydroCaru_V13_CALENDAR", JSON.stringify({
        isSetupComplete, plants, params, initialVol, history, lastRotation
      }));
    }
  }, [isSetupComplete, plants, params, initialVol, history, lastRotation]);

  const daysSinceRotation = useMemo(() => {
    const last = new Date(lastRotation).getTime();
    const now = new Date().getTime();
    return Math.floor((now - last) / (1000 * 60 * 60 * 24));
  }, [lastRotation]);

  const rotationPending = daysSinceRotation >= 7;

  const handleSystemRotation = () => {
    if(confirm('¿Confirmar Cosecha Nivel 3 y Rotación?')) {
      const withoutLevel3 = plants.filter(p => p.level !== 3);
      const rotated = withoutLevel3.map(p => ({ ...p, level: p.level + 1 }));
      setPlants(rotated);
      setLastRotation(new Date().toISOString());
      setActiveTab("tower");
    }
  };

  const systemStatus = useMemo(() => {
    const ph = parseFloat(params.pH) || 0;
    const ec = parseFloat(params.ec) || 0;
    const temp = parseFloat(params.temp) || 0;
    const currentVol = parseFloat(params.waterVol) || 0;
    const maxVol = parseFloat(initialVol) || 20;
    const targetEC = parseFloat(params.manualTargetEC) || 1.4;
    const alerts = [];

    if (rotationPending) {
        alerts.push({ title: 'TORRE: TOCA ROTAR', val: '7 DÍAS', desc: 'Revisa el calendario', color: 'bg-orange-600 animate-pulse', icon: <Clock /> });
    }
    if (currentVol < maxVol && (maxVol - currentVol) >= 0.1) {
      alerts.push({ title: 'RELLENAR AGUA', val: `${(maxVol - currentVol).toFixed(1)} L`, desc: 'Completar nivel', color: 'bg-cyan-600', icon: <Droplets /> });
    }
    if (ph > 6.2) alerts.push({ title: 'pH ALTO', val: 'BAJAR', desc: 'Añadir pH DOWN', color: 'bg-purple-600', icon: <ArrowDownCircle /> });
    else if (ph < 5.8 && ph > 0) alerts.push({ title: 'pH BAJO', val: 'SUBIR', desc: 'Añadir pH UP', color: 'bg-pink-600', icon: <ArrowDownCircle className="rotate-180" /> });
    
    if (ec < targetEC && ec > 0) alerts.push({ title: 'EC BAJA', val: 'A+B', desc: 'Añadir Nutrientes', color: 'bg-blue-700', icon: <FlaskConical /> });
    if (temp > 25) alerts.push({ title: 'TEMP ALTA', val: `${temp}°C`, desc: 'Hielo Urgente', color: 'bg-orange-600', icon: <Thermometer /> });

    return { alerts };
  }, [params, initialVol, rotationPending]);

  const LevelGrid = ({ lvl }: { lvl: number }) => (
    <div className="bg-slate-50 p-4 rounded-[2rem] border-2 border-dashed border-slate-200 grid grid-cols-3 gap-3">
      {[1, 2, 3, 4, 5, 6].map(pos => {
        const p = plants.find(x => x.level === lvl && x.position === pos);
        return (
          <button key={pos} onClick={() => { if (p) setPlants(plants.filter(x => x.id !== p.id)); else setShowPlantSelector({ lvl, pos }); }} className={`aspect-square rounded-2xl flex flex-col items-center justify-center border-2 transition-all ${p ? `${VARIETY_CONFIG[p.variety]?.bg} border-white text-white shadow-md` : 'bg-white border-slate-200 text-slate-300'}`}>
            {p ? <Sprout className="w-6 h-6" /> : <Plus className="w-5 h-5" />}
            {p && <span className="text-[7px] font-black uppercase mt-1">{p.variety.split(' ')[0]}</span>}
          </button>
        );
      })}
    </div>
  );

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center p-6">
        <Card className="w-full max-w-xs p-8 bg-white rounded-[2.5rem] text-center shadow-2xl">
          <Lock className="mx-auto mb-4 text-green-600" size={40} />
          <h2 className="text-xl font-black uppercase mb-6 italic">HydroCaru</h2>
          <input type="password" placeholder="PIN" className="w-full text-center text-3xl font-black bg-slate-100 rounded-2xl p-4 outline-none border-2 focus:border-green-500" value={pinInput} onChange={(e) => { if(e.target.value === MASTER_PIN) setIsAuthenticated(true); setPinInput(e.target.value); }} />
        </Card>
      </div>
    );
  }

  if (!isSetupComplete) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4">
        <Card className="w-full max-w-md p-8 bg-white rounded-[3rem] shadow-2xl text-center">
          <div className="text-3xl font-[1000] italic bg-gradient-to-r from-green-800 to-green-500 bg-clip-text text-transparent mb-8">HydroCaru</div>
          {setupStep === 1 ? (
            <div className="space-y-6">
              <h3 className="text-xl font-black uppercase text-slate-400">Volumen (L)</h3>
              <input type="number" value={initialVol} onChange={e => {setInitialVol(e.target.value); setParams({...params, waterVol: e.target.value})}} className="w-full bg-slate-50 rounded-3xl p-6 text-5xl font-black text-center border-2 border-green-100" />
              <button onClick={() => setSetupStep(2)} className="w-full bg-slate-900 text-white p-6 rounded-[2rem] font-black uppercase">Siguiente</button>
            </div>
          ) : setupStep === 2 ? (
            <div className="space-y-6">
              <h3 className="text-xl font-black uppercase text-slate-400">Plantar Nivel 1</h3>
              <LevelGrid lvl={1} />
              <button onClick={() => setSetupStep(3)} className="w-full bg-slate-900 text-white p-6 rounded-[2rem] font-black uppercase mt-4">Siguiente</button>
            </div>
          ) : (
            <div className="space-y-6">
              <h3 className="text-xl font-black uppercase text-slate-400">EC Objetivo</h3>
              <div className="bg-blue-600 p-8 rounded-[2.5rem] text-white">
                <input type="number" step="0.1" value={params.manualTargetEC} onChange={e => setParams({...params, manualTargetEC: e.target.value})} className="w-full bg-transparent text-6xl font-black text-center outline-none" />
              </div>
              <button onClick={() => setIsSetupComplete(true)} className="w-full bg-green-600 text-white p-6 rounded-[2rem] font-black uppercase shadow-xl">Iniciar Torre</button>
            </div>
          )}
        </Card>
        {showPlantSelector && (
          <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[9999] flex items-end p-4">
            <div className="bg-white w-full max-w-md mx-auto rounded-[3.5rem] p-10">
              <div className="grid grid-cols-1 gap-3">
                {Object.keys(VARIETY_CONFIG).map(v => (
                  <button key={v} onClick={() => { setPlants([...plants, {id: Date.now(), variety: v, level: showPlantSelector.lvl, position: showPlantSelector.pos}]); setShowPlantSelector(null); }} className={`w-full p-5 rounded-2xl font-black text-left ${VARIETY_CONFIG[v].bg} text-white shadow-lg`}>{v}</button>
                ))}
              </div>
              <button onClick={() => setShowPlantSelector(null)} className="w-full mt-8 p-2 text-slate-400 font-bold uppercase text-[10px]">Cerrar</button>
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 pb-32">
      <header className="bg-white border-b p-6 flex justify-between items-center sticky top-0 z-[100]">
        <div className="text-2xl font-[1000] italic bg-gradient-to-r from-green-800 to-green-500 bg-clip-text text-transparent">HydroCaru</div>
        <Badge className="bg-slate-900 text-white font-black px-4 py-1 rounded-full text-xs italic">{params.waterVol}L / {initialVol}L</Badge>
      </header>

      <main className="container mx-auto p-4 max-w-md">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid grid-cols-6 h-16 bg-white border-2 shadow-xl rounded-[1.5rem] p-1 mb-8">
            <TabsTrigger value="overview"><Activity size={20}/></TabsTrigger>
            <TabsTrigger value="measure"><Beaker size={20}/></TabsTrigger>
            <TabsTrigger value="tower"><Layers size={20}/></TabsTrigger>
            <TabsTrigger value="history"><CalendarIcon size={20}/></TabsTrigger>
            <TabsTrigger value="tips"><Lightbulb size={20}/></TabsTrigger>
            <TabsTrigger value="settings"><Trash2 size={20}/></TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-4">
            {systemStatus.alerts.map((alert, i) => (
              <Card key={i} className={`${alert.color} text-white p-6 rounded-[2.5rem] flex items-center gap-6 shadow-lg`}>
                <div className="w-10 h-10">{alert.icon}</div>
                <div><p className="text-[10px] font-black uppercase opacity-70">{alert.title}</p><p className="text-3xl font-black italic">{alert.val}</p><p className="text-[10px] font-bold uppercase mt-1">{alert.desc}</p></div>
              </Card>
            ))}
            {systemStatus.alerts.length === 0 && (
              <Card className="p-10 rounded-[2.5rem] bg-green-50 text-green-700 border-2 border-green-100 flex flex-col items-center justify-center gap-2"><Check size={40}/><span className="font-black uppercase text-sm italic">Todo en Orden</span></Card>
            )}
          </TabsContent>

          <TabsContent value="measure">
            <Card className="p-8 rounded-[3rem] bg-white shadow-2xl space-y-6">
              <div className="bg-blue-600 p-6 rounded-3xl text-white text-center shadow-inner">
                <label className="text-[9px] font-black uppercase opacity-60">Objetivo EC</label>
                <input type="number" step="0.1" value={params.manualTargetEC} onChange={e => setParams({...params, manualTargetEC: e.target.value})} className="w-full bg-transparent text-5xl outline-none text-center font-black" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-slate-50 p-5 rounded-3xl border-2"><label className="text-[9px] text-slate-400 block uppercase font-black">pH Real</label><input type="number" step="0.1" value={params.pH} onChange={e => setParams({...params, pH: e.target.value})} className="w-full bg-transparent text-3xl text-center outline-none font-black" /></div>
                <div className="bg-slate-50 p-5 rounded-3xl border-2"><label className="text-[9px] text-slate-400 block uppercase font-black">EC Real</label><input type="number" step="0.1" value={params.ec} onChange={e => setParams({...params, ec: e.target.value})} className="w-full bg-transparent text-3xl text-center outline-none font-black" /></div>
                <div className="bg-cyan-50 p-5 rounded-3xl border-2 border-cyan-100 text-cyan-700"><label className="text-[9px] block uppercase font-black opacity-70">Agua (L)</label><input type="number" value={params.waterVol} onChange={e => setParams({...params, waterVol: e.target.value})} className="w-full bg-transparent text-3xl text-center outline-none font-black" /></div>
                <div className="bg-orange-50 p-5 rounded-3xl border-2 border-orange-100 text-orange-700"><label className="text-[9px] block uppercase font-black opacity-70">Temp °C</label><input type="number" value={params.temp} onChange={e => setParams({...params, temp: e.target.value})} className="w-full bg-transparent text-3xl text-center outline-none font-black" /></div>
              </div>
              <button onClick={() => { setHistory([{...params, id: Date.now(), date: new Date().toLocaleString()}, ...history]); setActiveTab("overview"); }} className="w-full bg-slate-900 text-white p-7 rounded-[2.2rem] font-black uppercase shadow-xl mt-4">Analizar y Guardar</button>
            </Card>
          </TabsContent>

          <TabsContent value="tower" className="space-y-6">
            {[3, 2, 1].map(lvl => (
              <div key={lvl}><p className="text-[10px] font-black text-slate-400 uppercase mb-2 ml-4 italic">Nivel {lvl}</p><LevelGrid lvl={lvl} /></div>
            ))}
            {showPlantSelector && (
              <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[9999] flex items-end p-4">
                <div className="bg-white w-full max-w-md mx-auto rounded-[3.5rem] p-10">
                  <div className="grid grid-cols-1 gap-3">
                    {Object.keys(VARIETY_CONFIG).map(v => (
                      <button key={v} onClick={() => { setPlants([...plants, {id: Date.now(), variety: v, level: showPlantSelector.lvl, position: showPlantSelector.pos}]); setShowPlantSelector(null); }} className={`w-full p-5 rounded-2xl font-black text-left ${VARIETY_CONFIG[v].bg} text-white shadow-lg`}>{v}</button>
                    ))}
                  </div>
                  <button onClick={() => setShowPlantSelector(null)} className="w-full mt-8 p-2 text-slate-400 font-bold uppercase text-[10px]">Cerrar</button>
                </div>
              </div>
            )}
          </TabsContent>

          <TabsContent value="history" className="space-y-4">
             {/* ALERTA DE CALENDARIO DE ROTACIÓN */}
             {rotationPending && (
                <Card className="p-6 rounded-[2.5rem] bg-orange-600 text-white shadow-xl animate-pulse flex items-center justify-between border-none">
                    <div className="flex items-center gap-4">
                        <Clock size={32} />
                        <div>
                            <p className="text-[10px] font-black uppercase opacity-80 italic">Calendario: Día 7</p>
                            <p className="text-xl font-black uppercase italic">¡Toca Rotar Torre!</p>
                        </div>
                    </div>
                    <button onClick={handleSystemRotation} className="bg-white text-orange-600 p-3 rounded-2xl font-black"><Scissors size={20}/></button>
                </Card>
             )}

             <Card className="p-6 rounded-[2.5rem] bg-indigo-950 text-white shadow-xl">
                <h3 className="font-black uppercase text-[10px] mb-4 text-indigo-300 italic">Plan de Control de Cultivo</h3>
                <div className="grid grid-cols-4 gap-2">
                  {(plants.length / parseFloat(initialVol) > 0.6) ? 
                    ['Lun', 'Mar', 'Jue', 'Vie'].map(d => <div key={d} className="bg-white/10 p-2 rounded-xl text-center border border-white/10"><p className="text-[9px] font-black">{d}</p><p className="text-[7px] text-red-400 font-bold uppercase">Medir</p></div>) :
                    ['Lunes', 'Jueves'].map(d => <div key={d} className="bg-white/10 p-2 rounded-xl text-center border border-white/10"><p className="text-[9px] font-black">{d}</p><p className="text-[7px] text-indigo-300 font-bold uppercase">Medir</p></div>)
                  }
                </div>
             </Card>

             {history.map(h => {
               const ph = parseFloat(h.pH); const ec = parseFloat(h.ec); const target = parseFloat(h.manualTargetEC);
               const isBad = (ph > 6.2 || ph < 5.8) || (ec < target || ec > (target + 0.3));
               return (
                <Card key={h.id} className={`p-5 rounded-[2rem] bg-white border-2 font-black shadow-sm ${isBad ? 'border-red-400 bg-red-50' : 'border-slate-100'}`}>
                  <div className="flex justify-between items-center border-b pb-2 mb-1">
                    <span className="text-[8px] text-slate-400">{h.date}</span>
                    <Badge className={`${isBad ? 'bg-red-500' : 'bg-blue-600'} text-white text-[9px] px-3`}>{isBad ? 'FUERA' : 'OK'}</Badge>
                  </div>
                  <div className="flex justify-around text-xs italic">
                    <span className={ph > 6.2 || ph < 5.8 ? 'text-red-600' : 'text-slate-800'}>pH {h.pH}</span>
                    <span className={ec < target || ec > (target + 0.3) ? 'text-red-600' : 'text-emerald-600'}>EC {h.ec}</span>
                    <span className={parseFloat(h.temp) > 25 ? 'text-red-600' : 'text-orange-400'}>{h.temp}°C</span>
                  </div>
                </Card>
               );
             })}
          </TabsContent>

          <TabsContent value="tips" className="space-y-6 pb-10">
            <Card className="overflow-hidden rounded-[3rem] shadow-xl bg-white border-2 border-orange-100">
              <div className="bg-orange-500 p-5 flex items-center gap-3 text-white"><Layers size={24} /><h3 className="font-black uppercase text-sm italic">Preparar Lana de Roca</h3></div>
              <div className="p-7 space-y-4 text-xs font-bold text-slate-600">
                <p>1. <span className="text-orange-600 font-black">Hidratar 24h</span> en agua pH 5.5 para neutralizar la roca.</p>
                <p>2. Mantener húmeda pero con aire para evitar pudrición radicular.</p>
              </div>
            </Card>

            <div className="grid grid-cols-2 gap-4">
              <Card className="p-6 rounded-[2.5rem] bg-slate-900 text-white shadow-lg"><Zap className="text-yellow-400 mb-2"/><h4 className="text-[10px] font-black uppercase">EC Alta</h4><p className="text-[9px] opacity-60">Puntas quemadas = exceso de sales. Diluye con agua.</p></Card>
              <Card className="p-6 rounded-[2.5rem] bg-blue-600 text-white shadow-lg"><Thermometer className="text-blue-200 mb-2"/><h4 className="text-[10px] font-black uppercase">Calor</h4><p className="text-[9px] opacity-60">+25°C asfixia raíces. Usa botellas de hielo.</p></Card>
            </div>
          </TabsContent>

          <TabsContent value="settings" className="py-10">
             <button onClick={() => {if(confirm('¿BORRAR TODO?')) {localStorage.removeItem("hydroCaru_V13_CALENDAR"); window.location.reload();}}} className="w-full bg-red-100 text-red-600 p-10 rounded-[3rem] font-black uppercase text-xs border-2 border-red-200 shadow-xl">Resetear App</button>
             <p className="text-center mt-6 text-[8px] font-black text-slate-300 tracking-widest uppercase italic">HydroCaru v13.0 Ultimate Calendar</p>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}
