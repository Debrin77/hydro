"use client"

import React, { useState, useEffect, useMemo } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { 
  Sprout, Activity, Layers, Beaker, Calendar as CalendarIcon, 
  History, Plus, Trash2, FlaskConical, 
  ArrowDownCircle, Droplets, Check, Gauge, Lock, Lightbulb, 
  AlertTriangle, Thermometer, Info, ChevronRight, Zap
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
    const saved = localStorage.getItem("hydroCaru_V9_ULTIMATE");
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
      localStorage.setItem("hydroCaru_V9_ULTIMATE", JSON.stringify({
        isSetupComplete, plants, params, initialVol, history, lastRotation
      }));
    }
  }, [isSetupComplete, plants, params, initialVol, history, lastRotation]);

  // --- LÓGICA DE ALERTA Y CORRECCIÓN ---
  const checkStatus = (p: any) => {
    const ph = parseFloat(p.pH);
    const ec = parseFloat(p.ec);
    const t = parseFloat(p.temp);
    const target = parseFloat(p.manualTargetEC);
    return {
      phErr: ph > 6.2 || ph < 5.8,
      ecErr: ec < target || ec > (target + 0.3),
      tErr: t > 25 || t < 15,
      isBad: (ph > 6.2 || ph < 5.8) || (ec < target || ec > (target + 0.3)) || (t > 25 || t < 15)
    };
  };

  const systemStatus = useMemo(() => {
    const ph = parseFloat(params.pH) || 0;
    const ec = parseFloat(params.ec) || 0;
    const temp = parseFloat(params.temp) || 0;
    const currentVol = parseFloat(params.waterVol) || 0;
    const maxVol = parseFloat(initialVol) || 20;
    const targetEC = parseFloat(params.manualTargetEC) || 1.4;
    const alerts = [];

    if (currentVol < maxVol && (maxVol - currentVol) >= 0.1) {
      alerts.push({ title: 'RELLENAR AGUA', val: `${(maxVol - currentVol).toFixed(1)} L`, desc: 'Añadir agua pura', color: 'bg-cyan-600', icon: <Droplets /> });
    }
    if (ph > 6.2) {
      alerts.push({ title: 'pH ALTO', val: `${((ph - 6.0) * currentVol * 1.5).toFixed(0)} ml`, desc: 'Dosis pH DOWN', color: 'bg-purple-600', icon: <ArrowDownCircle /> });
    } else if (ph < 5.8 && ph > 0) {
      alerts.push({ title: 'pH BAJO', val: `${((6.0 - ph) * currentVol * 1.5).toFixed(0)} ml`, desc: 'Dosis pH UP', color: 'bg-pink-600', icon: <ArrowDownCircle className="rotate-180" /> });
    }
    if (ec < targetEC && ec > 0) {
      alerts.push({ title: 'EC BAJA', val: `${(((targetEC - ec) / 0.1) * currentVol * 0.25).toFixed(1)} ml`, desc: 'Añadir A + B', color: 'bg-blue-700', icon: <FlaskConical /> });
    } else if (ec > (targetEC + 0.3)) {
      alerts.push({ title: 'EC ALTA', val: `${(((ec - targetEC) / targetEC) * currentVol).toFixed(1)} L`, desc: 'Diluir con agua', color: 'bg-red-600', icon: <AlertTriangle /> });
    }
    if (temp > 25) alerts.push({ title: 'TEMP ALTA', val: `${temp}°C`, desc: 'Añadir hielo', color: 'bg-orange-600', icon: <Thermometer /> });

    return { alerts };
  }, [params, initialVol]);

  // --- COMPONENTES AUXILIARES ---
  const LevelGrid = ({ lvl }: { lvl: number }) => (
    <div className="bg-slate-50 p-4 rounded-[2rem] border-2 border-dashed border-slate-200 grid grid-cols-3 gap-3">
      {[1, 2, 3, 4, 5, 6].map(pos => {
        const p = plants.find(x => x.level === lvl && x.position === pos);
        return (
          <button key={pos} onClick={() => { if (p) setPlants(plants.filter(x => x.id !== p.id)); else setShowPlantSelector({ lvl, pos }); }} className={`aspect-square rounded-2xl flex flex-col items-center justify-center border-2 transition-all ${p ? `${VARIETY_CONFIG[p.variety]?.bg} border-white text-white shadow-md active:scale-90` : 'bg-white border-slate-200 text-slate-300'}`}>
            {p ? <Sprout className="w-6 h-6" /> : <Plus className="w-5 h-5" />}
            {p && <span className="text-[7px] font-black uppercase mt-1">{p.variety.split(' ')[0]}</span>}
          </button>
        );
      })}
    </div>
  );

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center p-6 text-slate-800">
        <Card className="w-full max-w-xs p-8 bg-white rounded-[2.5rem] text-center shadow-2xl">
          <Lock className="mx-auto mb-4 text-green-600" size={40} />
          <h2 className="text-xl font-black uppercase mb-6 italic">HydroCaru Login</h2>
          <input type="password" placeholder="PIN" className="w-full text-center text-3xl font-black bg-slate-100 rounded-2xl p-4 outline-none border-2 focus:border-green-500" value={pinInput} onChange={(e) => { setPinInput(e.target.value); if(e.target.value === MASTER_PIN) setIsAuthenticated(true); }} />
        </Card>
      </div>
    );
  }

  if (!isSetupComplete) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4">
        <Card className="w-full max-w-md p-8 bg-white rounded-[3rem] shadow-2xl text-center text-slate-800">
          <div className="text-3xl font-[900] tracking-tight bg-gradient-to-r from-green-800 to-green-500 bg-clip-text text-transparent italic mb-8">HydroCaru</div>
          {setupStep === 1 && (
            <div className="space-y-6">
              <h3 className="text-xl font-black uppercase text-slate-400 italic">Volumen Depósito</h3>
              <input type="number" value={initialVol} onChange={e => setInitialVol(e.target.value)} className="w-full bg-slate-50 rounded-3xl p-6 text-5xl font-black text-center border-2 border-green-100 outline-none" />
              <button onClick={() => setSetupStep(2)} className="w-full bg-slate-900 text-white p-6 rounded-[2rem] font-black uppercase shadow-xl">Siguiente</button>
            </div>
          )}
          {setupStep === 2 && (
            <div className="space-y-6">
              <h3 className="text-xl font-black uppercase text-slate-400 italic">Cargar Nivel 1</h3>
              <LevelGrid lvl={1} />
              <button disabled={plants.length === 0} onClick={() => setSetupStep(3)} className="w-full bg-slate-900 text-white p-6 rounded-[2rem] font-black uppercase shadow-xl disabled:opacity-20">Siguiente</button>
            </div>
          )}
          {setupStep === 3 && (
            <div className="space-y-6">
              <h3 className="text-xl font-black uppercase text-slate-400 italic">EC Objetivo</h3>
              <div className="bg-blue-600 p-8 rounded-[2.5rem] text-white">
                <input type="number" step="0.1" value={params.manualTargetEC} onChange={e => setParams({...params, manualTargetEC: e.target.value})} className="w-full bg-transparent text-6xl font-black text-center outline-none" />
              </div>
              <button onClick={() => setIsSetupComplete(true)} className="w-full bg-green-600 text-white p-6 rounded-[2rem] font-black uppercase shadow-xl">Iniciar</button>
            </div>
          )}
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 pb-32 text-slate-800">
      <header className="bg-white border-b p-6 flex justify-between items-center sticky top-0 z-[100] shadow-sm">
        <div className="text-2xl font-[900] tracking-tight bg-gradient-to-r from-green-800 to-green-500 bg-clip-text text-transparent italic">HydroCaru</div>
        <Badge className="bg-slate-900 text-white font-black px-4 py-1 rounded-full text-xs italic">{params.waterVol}L / {initialVol}L</Badge>
      </header>

      <main className="container mx-auto p-4 max-w-md">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid grid-cols-6 h-16 bg-white border-2 shadow-xl rounded-[1.5rem] p-1 mb-8 overflow-hidden">
            <TabsTrigger value="overview"><Activity size={20}/></TabsTrigger>
            <TabsTrigger value="measure"><Beaker size={20}/></TabsTrigger>
            <TabsTrigger value="tower"><Layers size={20}/></TabsTrigger>
            <TabsTrigger value="history"><CalendarIcon size={20}/></TabsTrigger>
            <TabsTrigger value="tips"><Lightbulb size={20}/></TabsTrigger>
            <TabsTrigger value="settings"><Trash2 size={20}/></TabsTrigger>
          </TabsList>

          {/* --- VISTA GENERAL --- */}
          <TabsContent value="overview" className="space-y-4 animate-in fade-in">
            {systemStatus.alerts.map((alert, i) => (
              <Card key={i} className={`${alert.color} text-white p-6 rounded-[2.5rem] flex items-center gap-6 border-none shadow-lg`}>
                <div className="w-10 h-10">{alert.icon}</div>
                <div>
                  <p className="text-[10px] font-black uppercase opacity-70">{alert.title}</p>
                  <p className="text-3xl font-black italic">{alert.val}</p>
                  <p className="text-[10px] font-bold uppercase mt-1">{alert.desc}</p>
                </div>
              </Card>
            ))}
            {systemStatus.alerts.length === 0 && (
              <Card className="p-10 rounded-[2.5rem] bg-green-50 text-green-700 border-2 border-green-100 flex flex-col items-center justify-center gap-2">
                <Check size={40}/><span className="font-black uppercase text-sm italic">Estado Óptimo</span>
              </Card>
            )}
          </TabsContent>

          {/* --- MEDICIÓN --- */}
          <TabsContent value="measure">
            <Card className="p-8 rounded-[3rem] bg-white shadow-2xl border-none space-y-6">
              <div className="bg-blue-600 p-6 rounded-3xl text-white text-center shadow-inner">
                <label className="text-[9px] font-black uppercase opacity-60">EC Objetivo</label>
                <input type="number" step="0.1" value={params.manualTargetEC} onChange={e => setParams({...params, manualTargetEC: e.target.value})} className="w-full bg-transparent text-5xl outline-none text-center font-black" />
              </div>
              <div className="grid grid-cols-2 gap-4 text-slate-800">
                <div className="bg-slate-50 p-5 rounded-3xl border-2"><label className="text-[9px] text-slate-400 block uppercase font-black">pH Actual</label><input type="number" step="0.1" value={params.pH} onChange={e => setParams({...params, pH: e.target.value})} className="w-full bg-transparent text-3xl text-center outline-none font-black" /></div>
                <div className="bg-slate-50 p-5 rounded-3xl border-2"><label className="text-[9px] text-slate-400 block uppercase font-black">EC Real</label><input type="number" step="0.1" value={params.ec} onChange={e => setParams({...params, ec: e.target.value})} className="w-full bg-transparent text-3xl text-center outline-none font-black" /></div>
                <div className="bg-cyan-50 p-5 rounded-3xl border-2 border-cyan-100 text-cyan-700"><label className="text-[9px] block uppercase font-black opacity-70">Nivel (L)</label><input type="number" value={params.waterVol} onChange={e => setParams({...params, waterVol: e.target.value})} className="w-full bg-transparent text-3xl text-center outline-none font-black" /></div>
                <div className="bg-orange-50 p-5 rounded-3xl border-2 border-orange-100 text-orange-700"><label className="text-[9px] block uppercase font-black opacity-70">Temp °C</label><input type="number" value={params.temp} onChange={e => setParams({...params, temp: e.target.value})} className="w-full bg-transparent text-3xl text-center outline-none font-black" /></div>
              </div>
              <button onClick={() => { setHistory([{...params, id: Date.now(), date: new Date().toLocaleString()}, ...history]); setActiveTab("overview"); }} className="w-full bg-slate-900 text-white p-7 rounded-[2.2rem] font-black uppercase shadow-xl mt-4">Guardar Registro</button>
            </Card>
          </TabsContent>

          {/* --- TORRE --- */}
          <TabsContent value="tower" className="space-y-6">
            {[1, 2, 3].map(lvl => (
              <div key={lvl}><p className="text-[10px] font-black text-slate-400 uppercase mb-2 ml-4 italic">Nivel Vertical {lvl}</p><LevelGrid lvl={lvl} /></div>
            ))}
            <Card className="p-8 rounded-[2.5rem] bg-slate-900 text-white text-center shadow-xl">
                <p className="text-[10px] font-black uppercase text-slate-500 mb-2">Próxima Rotación</p>
                <p className="text-3xl font-black italic">{new Date(new Date(lastRotation).getTime() + 14 * 86400000).toLocaleDateString()}</p>
                <button onClick={() => { if(confirm('¿Rotar?')) { const r = plants.filter(p => p.level !== 3).map(p => ({ ...p, level: p.level + 1 })); setPlants(r); setLastRotation(new Date().toISOString()); } }} className="mt-6 w-full bg-green-600 px-6 py-4 rounded-2xl font-black uppercase text-xs">Rotar Hoy</button>
             </Card>
          </TabsContent>

          {/* --- HISTORIAL Y PLAN --- */}
          <TabsContent value="history" className="space-y-4">
             {/* PLANIFICACIÓN DINÁMICA */}
             <Card className="p-6 rounded-[2.5rem] bg-indigo-950 text-white shadow-xl border-2 border-indigo-500/30">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2"><CalendarIcon size={18} className="text-indigo-400"/><h3 className="font-black uppercase text-[10px] tracking-widest">Plan Inteligente</h3></div>
                  <Badge className="bg-indigo-500 text-[8px]">{plants.length} Plantas / {initialVol}L</Badge>
                </div>
                <div className="grid grid-cols-3 gap-2">
                  {/* Lógica: Si hay muchas plantas para poco agua, aumentar frecuencia */}
                  { (plants.length / parseFloat(initialVol) > 0.5) ? (
                    ['Lun', 'Mar', 'Jue', 'Vie'].map(d => <div key={d} className="bg-white/10 p-2 rounded-xl text-center border border-white/10"><p className="text-[8px] font-black opacity-50">{d}</p><p className="text-[9px] font-bold text-red-400">MEDIR</p></div>)
                  ) : (
                    ['Lunes', 'Jueves'].map(d => <div key={d} className="bg-white/10 p-2 rounded-xl text-center border border-white/10"><p className="text-[8px] font-black opacity-50">{d}</p><p className="text-[9px] font-bold text-indigo-300">MEDIR</p></div>)
                  )}
                </div>
                <p className="text-[8px] mt-4 opacity-40 text-center italic uppercase font-black">Frecuencia calculada por presión osmótica actual</p>
             </Card>

             <h2 className="text-xl font-black italic text-slate-800 ml-2 mt-6 uppercase">Bitácora Técnica</h2>
             {history.map(h => {
               const status = checkStatus(h);
               return (
                <Card key={h.id} className={`p-5 rounded-[2rem] bg-white border-2 font-black shadow-sm flex flex-col gap-2 transition-all ${status.isBad ? 'border-red-200' : 'border-slate-100'}`}>
                  <div className="flex justify-between items-center border-b pb-2 mb-1">
                    <span className="text-[8px] text-slate-400">{h.date}</span>
                    <div className="flex gap-2 items-center">
                      {status.isBad && <AlertTriangle size={12} className="text-red-500 animate-pulse"/>}
                      <Badge className={`${status.isBad ? 'bg-red-500' : 'bg-blue-600'} text-white text-[9px] px-3`}>{h.waterVol}L</Badge>
                    </div>
                  </div>
                  <div className="flex justify-around text-xs italic">
                    <span className={`flex items-center gap-1 ${status.phErr ? 'text-red-600 underline decoration-2' : 'text-slate-800'}`}>pH {h.pH}</span>
                    <span className={`flex items-center gap-1 ${status.ecErr ? 'text-red-600 underline decoration-2' : 'text-emerald-600'}`}>EC {h.ec}</span>
                    <span className={`${status.tErr ? 'text-red-600 font-black' : 'text-orange-400'}`}>{h.temp}°C</span>
                  </div>
                </Card>
               );
             })}
          </TabsContent>

          {/* --- SABIDURÍA MAESTRO (GRÁFICA) --- */}
          <TabsContent value="tips" className="space-y-6 pb-10">
            <div className="text-center space-y-1 mb-8">
              <h2 className="text-2xl font-[1000] italic text-slate-900 uppercase tracking-tighter">Guía de Cultivo</h2>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Protocolos de Máximo Rendimiento</p>
            </div>

            <Card className="overflow-hidden rounded-[2.5rem] border-none shadow-xl bg-white">
              <div className="bg-emerald-500 p-4 flex items-center gap-3 text-white">
                <Sprout size={24} /> <h3 className="font-black uppercase text-sm italic">Fase de Transplante</h3>
              </div>
              <div className="p-6 space-y-4">
                <div className="flex gap-4 items-start">
                  <div className="w-8 h-8 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center font-black shrink-0">1</div>
                  <p className="text-xs font-medium text-slate-600">Lavar raíces en agua a <span className="text-emerald-600 font-bold">22°C</span>. El shock térmico detiene el crecimiento 3 días.</p>
                </div>
                <div className="flex gap-4 items-start">
                  <div className="w-8 h-8 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center font-black shrink-0">2</div>
                  <p className="text-xs font-medium text-slate-600">Usa una gota de <span className="text-emerald-600 font-bold">Agua Oxigenada</span> en el lavado para desinfectar patógenos.</p>
                </div>
              </div>
            </Card>

            <div className="grid grid-cols-2 gap-4">
              <Card className="p-6 rounded-[2.5rem] bg-slate-900 text-white border-none shadow-lg">
                <Zap className="text-yellow-400 mb-3" size={24}/>
                <h4 className="font-black uppercase text-[10px] mb-2 tracking-widest">EC Alta</h4>
                <p className="text-[10px] opacity-70 leading-relaxed font-medium text-slate-400">Hojas con puntas quemadas. Diluye con agua pura de inmediato.</p>
              </Card>
              <Card className="p-6 rounded-[2.5rem] bg-blue-600 text-white border-none shadow-lg">
                <Droplets className="text-blue-200 mb-3" size={24}/>
                <h4 className="font-black uppercase text-[10px] mb-2 tracking-widest">Oxígeno</h4>
                <p className="text-[10px] opacity-70 leading-relaxed font-medium text-blue-100">Si el agua supera los 25°C, el oxígeno cae. ¡Usa botellas de hielo!</p>
              </Card>
            </div>

            <Card className="p-8 rounded-[2.5rem] bg-gradient-to-br from-slate-800 to-slate-900 text-white shadow-2xl relative overflow-hidden">
              <div className="absolute top-0 right-0 p-4 opacity-10"><FlaskConical size={100} /></div>
              <h3 className="font-black uppercase text-xs mb-4 flex items-center gap-2 text-yellow-400 italic">
                <Info size={16}/> Tabla de Nutrición Pro
              </h3>
              <div className="space-y-3">
                <div className="flex justify-between items-center text-[10px] border-b border-white/10 pb-2">
                  <span className="font-bold opacity-50 uppercase">Semana 1-2</span>
                  <span className="font-black italic">EC 0.8 | pH 5.8</span>
                </div>
                <div className="flex justify-between items-center text-[10px] border-b border-white/10 pb-2 text-yellow-400">
                  <span className="font-bold uppercase">Semana 3+</span>
                  <span className="font-black italic">EC 1.4 | pH 6.0</span>
                </div>
                <div className="flex justify-between items-center text-[10px] text-red-400">
                  <span className="font-bold uppercase">Cosecha</span>
                  <span className="font-black italic">Solo Agua (24h)</span>
                </div>
              </div>
            </Card>
          </TabsContent>

          {/* --- AJUSTES --- */}
          <TabsContent value="settings" className="py-10">
             <button onClick={() => {if(confirm('¿BORRAR TODO?')) {localStorage.removeItem("hydroCaru_V9_ULTIMATE"); window.location.reload();}}} className="w-full bg-red-100 text-red-600 p-10 rounded-[3rem] font-black uppercase text-xs tracking-widest border-2 border-red-200 shadow-lg active:bg-red-200">Reset de Fábrica</button>
             <p className="text-center mt-6 text-[8px] font-black text-slate-300 tracking-widest uppercase italic">HydroCaru v9.0 Ultimate Edition</p>
          </TabsContent>
        </Tabs>
      </main>

      {/* MODAL SELECTOR */}
      {showPlantSelector && (
          <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[9999] flex items-end p-4">
            <div className="bg-white w-full max-w-md mx-auto rounded-[3.5rem] p-10 animate-in slide-in-from-bottom">
              <h3 className="text-center font-black uppercase text-xs mb-8 text-slate-400 italic">Variedad de Cultivo</h3>
              <div className="grid grid-cols-1 gap-3">
                {Object.keys(VARIETY_CONFIG).map(v => (
                  <button key={v} onClick={() => { setPlants([...plants, {id: Date.now(), variety: v, level: showPlantSelector.lvl, position: showPlantSelector.pos}]); setShowPlantSelector(null); }} className={`w-full p-5 rounded-2xl font-black text-left ${VARIETY_CONFIG[v].bg} text-white shadow-lg active:scale-95 transition-transform`}>{v}</button>
                ))}
              </div>
              <button onClick={() => setShowPlantSelector(null)} className="w-full mt-8 p-2 text-slate-400 font-bold uppercase text-[10px]">Cerrar</button>
            </div>
          </div>
      )}
    </div>
  );
}
