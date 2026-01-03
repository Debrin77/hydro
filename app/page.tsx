"use client"

import React, { useState, useEffect, useMemo } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { 
  Sprout, Activity, Layers, Beaker, Calendar as CalendarIcon, 
  History, Plus, Trash2, FlaskConical, 
  ArrowDownCircle, Droplets, Check, Gauge, Lock, Lightbulb, AlertTriangle
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
    const saved = localStorage.getItem("hydroCaru_FULL_V6");
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
      localStorage.setItem("hydroCaru_FULL_V6", JSON.stringify({
        isSetupComplete, plants, params, initialVol, history, lastRotation
      }));
    }
  }, [isSetupComplete, plants, params, initialVol, history, lastRotation]);

  // --- MOTOR DE CÁLCULO DE ALERTAS Y CORRECCIONES ---
  const systemStatus = useMemo(() => {
    const ph = parseFloat(params.pH) || 0;
    const ec = parseFloat(params.ec) || 0;
    const currentVol = parseFloat(params.waterVol) || 0;
    const maxVol = parseFloat(initialVol) || 20;
    const targetEC = parseFloat(params.manualTargetEC) || 1.4;
    const alerts = [];

    // 1. Alerta de Agua
    if (currentVol < maxVol) {
      const diff = maxVol - currentVol;
      if (diff >= 0.1) {
        alerts.push({ title: 'RELLENAR DEPÓSITO', val: `${diff.toFixed(1)} L`, desc: 'Agua necesaria para nivel óptimo', color: 'bg-cyan-600', icon: <Droplets /> });
      }
    }

    // 2. Alerta de pH
    if (ph > 6.2) {
      const correction = (ph - 6.0) * currentVol * 2; // Estimación: 2ml por cada 0.1 de ph y 10L
      alerts.push({ title: 'pH DEMASIADO ALTO', val: `${correction.toFixed(0)} ml`, desc: 'Añadir pH DOWN (Ácido Phosphórico)', color: 'bg-purple-600', icon: <ArrowDownCircle /> });
    } else if (ph < 5.8 && ph > 0) {
      const correction = (6.0 - ph) * currentVol * 2;
      alerts.push({ title: 'pH DEMASIADO BAJO', val: `${correction.toFixed(0)} ml`, desc: 'Añadir pH UP (Potasio)', color: 'bg-pink-600', icon: <ArrowDownCircle className="rotate-180" /> });
    }

    // 3. Alerta de EC (Nutrientes)
    if (ec < targetEC && ec > 0) {
      // Cálculo: Para subir 0.1 EC en 1L se necesitan aprox 0.25ml de A y 0.25ml de B
      const correctionNutri = ((targetEC - ec) / 0.1) * currentVol * 0.25;
      alerts.push({ title: 'EC BAJA (NUTRIENTES)', val: `${correctionNutri.toFixed(1)} ml`, desc: 'Dosis de A y de B (cada uno)', color: 'bg-blue-700', icon: <FlaskConical /> });
    } else if (ec > (targetEC + 0.3)) {
      const extraAgua = ((ec - targetEC) / targetEC) * currentVol;
      alerts.push({ title: 'EC ALTA (PELIGRO)', val: `${extraAgua.toFixed(1)} L`, desc: 'Añadir agua pura para diluir', color: 'bg-red-600', icon: <AlertTriangle /> });
    }

    return { alerts };
  }, [params, initialVol]);

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

  const SelectorPopUp = () => (
    showPlantSelector && (
      <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[9999] flex items-end p-4">
        <div className="bg-white w-full max-w-md mx-auto rounded-[3.5rem] p-10 animate-in slide-in-from-bottom">
          <h3 className="text-center font-black uppercase text-xs mb-8 text-slate-400">Variedad de Lechuga</h3>
          <div className="grid grid-cols-1 gap-3">
            {Object.keys(VARIETY_CONFIG).map(v => (
              <button key={v} onClick={() => { setPlants([...plants, {id: Date.now(), variety: v, level: showPlantSelector.lvl, position: showPlantSelector.pos}]); setShowPlantSelector(null); }} className={`w-full p-5 rounded-2xl font-black text-left ${VARIETY_CONFIG[v].bg} text-white`}>{v}</button>
            ))}
          </div>
          <button onClick={() => setShowPlantSelector(null)} className="w-full mt-8 p-2 text-slate-400 font-bold uppercase text-[10px]">Cerrar</button>
        </div>
      </div>
    )
  );

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center p-6">
        <Card className="w-full max-w-xs p-8 bg-white rounded-[2.5rem] text-center shadow-2xl text-slate-800">
          <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-4"><Lock /></div>
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
          <div className="text-3xl font-[900] tracking-tight bg-gradient-to-r from-green-800 to-green-500 bg-clip-text text-transparent italic mb-8 pr-2">HydroCaru</div>
          {setupStep === 1 && (
            <div className="space-y-6">
              <h3 className="text-xl font-black uppercase tracking-tighter text-slate-400">Paso 1: Capacidad Depósito</h3>
              <div className="relative">
                <input type="number" value={initialVol} onChange={e => {setInitialVol(e.target.value); setParams({...params, waterVol: e.target.value})}} className="w-full bg-slate-50 rounded-3xl p-6 text-5xl font-black text-center border-2 border-green-100 outline-none" />
                <span className="absolute bottom-4 right-8 font-black text-slate-200">LITROS</span>
              </div>
              <button onClick={() => setSetupStep(2)} className="w-full bg-slate-900 text-white p-6 rounded-[2rem] font-black uppercase shadow-xl">Continuar</button>
            </div>
          )}
          {setupStep === 2 && (
            <div className="space-y-6">
              <h3 className="text-xl font-black uppercase tracking-tighter text-slate-400">Paso 2: Plantar Nivel 1</h3>
              <LevelGrid lvl={1} />
              <button disabled={plants.length === 0} onClick={() => setSetupStep(3)} className="w-full bg-slate-900 text-white p-6 rounded-[2rem] font-black uppercase disabled:opacity-20 shadow-xl">Continuar</button>
            </div>
          )}
          {setupStep === 3 && (
            <div className="space-y-6">
              <h3 className="text-xl font-black uppercase tracking-tighter text-slate-400">Paso 3: EC de Trabajo</h3>
              <div className="bg-blue-600 p-8 rounded-[2.5rem] text-white shadow-inner text-center">
                <input type="number" step="0.1" value={params.manualTargetEC} onChange={e => setParams({...params, manualTargetEC: e.target.value})} className="w-full bg-transparent text-6xl font-black text-center outline-none" />
                <p className="text-[10px] font-bold mt-2 opacity-70">mS/cm (Recomendado 1.4)</p>
              </div>
              <button onClick={() => setIsSetupComplete(true)} className="w-full bg-green-600 text-white p-6 rounded-[2rem] font-black uppercase shadow-xl">Activar Sistema</button>
            </div>
          )}
        </Card>
        <SelectorPopUp />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 pb-32 text-slate-800">
      <header className="bg-white border-b p-6 flex justify-between items-center sticky top-0 z-50 shadow-sm">
        <div className="flex items-center gap-3">
           <div className="w-10 h-10 rounded-full overflow-hidden border-2 border-green-400 bg-slate-100 flex-shrink-0">
             <img src="https://i.ibb.co/Lz0p6yR/logo-hydro.png" alt="L" className="w-full h-full object-cover" />
           </div>
           <div className="text-2xl font-[900] tracking-tight bg-gradient-to-r from-green-800 to-green-500 bg-clip-text text-transparent italic pr-2">HydroCaru</div>
        </div>
        <Badge className="bg-slate-900 text-white font-black px-4 py-1 rounded-full text-xs italic">{params.waterVol}L / {initialVol}L</Badge>
      </header>

      <main className="container mx-auto p-4 max-w-md">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid grid-cols-6 h-16 bg-white border-2 shadow-xl rounded-[1.5rem] p-1 mb-8 overflow-hidden">
            <TabsTrigger value="overview"><Activity size={20}/></TabsTrigger>
            <TabsTrigger value="measure"><Beaker size={20}/></TabsTrigger>
            <TabsTrigger value="tower"><Layers size={20}/></TabsTrigger>
            <TabsTrigger value="tips"><Lightbulb size={20}/></TabsTrigger>
            <TabsTrigger value="history"><CalendarIcon size={20}/></TabsTrigger>
            <TabsTrigger value="settings"><Trash2 size={20}/></TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-4 animate-in fade-in">
            {systemStatus.alerts.map((alert, i) => (
              <Card key={i} className={`${alert.color} text-white p-6 rounded-[2.5rem] flex items-center gap-6 border-none shadow-lg`}>
                <div className="w-10 h-10">{alert.icon}</div>
                <div>
                  <p className="text-[10px] font-black uppercase opacity-70 tracking-tighter">{alert.title}</p>
                  <p className="text-3xl font-black italic">{alert.val}</p>
                  <p className="text-[10px] font-bold uppercase mt-1">{alert.desc}</p>
                </div>
              </Card>
            ))}
            {systemStatus.alerts.length === 0 && (
              <Card className="p-10 rounded-[2.5rem] bg-green-50 text-green-700 border-2 border-green-100 flex flex-col items-center justify-center gap-2">
                <Check size={40} className="mb-2"/>
                <span className="font-black uppercase text-sm italic tracking-widest text-center">Sistema en Equilibrio Perfecto</span>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="measure" className="animate-in fade-in">
            <Card className="p-8 rounded-[3rem] bg-white shadow-2xl border-none space-y-6">
              <div className="bg-blue-600 p-6 rounded-3xl text-white text-center shadow-inner">
                <label className="text-[9px] font-black uppercase opacity-60 tracking-widest">EC Objetivo</label>
                <input type="number" step="0.1" value={params.manualTargetEC} onChange={e => setParams({...params, manualTargetEC: e.target.value})} className="w-full bg-transparent text-5xl outline-none text-center font-black" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-slate-50 p-5 rounded-3xl border-2"><label className="text-[9px] text-slate-400 block uppercase font-black">pH Actual</label><input type="number" step="0.1" value={params.pH} onChange={e => setParams({...params, pH: e.target.value})} className="w-full bg-transparent text-3xl text-center outline-none font-black text-slate-800" /></div>
                <div className="bg-slate-50 p-5 rounded-3xl border-2"><label className="text-[9px] text-slate-400 block uppercase font-black">EC Real</label><input type="number" step="0.1" value={params.ec} onChange={e => setParams({...params, ec: e.target.value})} className="w-full bg-transparent text-3xl text-center outline-none font-black text-slate-800" /></div>
                <div className="bg-cyan-50 p-5 rounded-3xl border-2 border-cyan-100 text-cyan-700"><label className="text-[9px] block uppercase font-black opacity-70">Nivel Agua (L)</label><input type="number" value={params.waterVol} onChange={e => setParams({...params, waterVol: e.target.value})} className="w-full bg-transparent text-3xl text-center outline-none font-black" /></div>
                <div className="bg-orange-50 p-5 rounded-3xl border-2 border-orange-100 text-orange-700"><label className="text-[9px] block uppercase font-black opacity-70">Temp °C</label><input type="number" value={params.temp} onChange={e => setParams({...params, temp: e.target.value})} className="w-full bg-transparent text-3xl text-center outline-none font-black" /></div>
              </div>
              <button onClick={() => { setHistory([{...params, id: Date.now(), date: new Date().toLocaleString()}, ...history]); setActiveTab("overview"); }} className="w-full bg-slate-900 text-white p-7 rounded-[2.2rem] font-black uppercase shadow-xl mt-4 active:scale-95 transition-all">Registrar y Calcular</button>
            </Card>
          </TabsContent>

          <TabsContent value="tower" className="space-y-6">
            {[1, 2, 3].map(lvl => (
              <div key={lvl}><p className="text-[10px] font-black text-slate-400 uppercase mb-2 ml-4 tracking-widest italic">Nivel {lvl}</p><LevelGrid lvl={lvl} /></div>
            ))}
            <Card className="p-8 rounded-[2.5rem] bg-slate-900 text-white text-center shadow-xl relative overflow-hidden">
                <p className="text-[10px] font-black uppercase text-slate-500 mb-2 italic">Control de Rotación</p>
                <p className="text-3xl font-black italic">{new Date(new Date(lastRotation).getTime() + 14 * 86400000).toLocaleDateString()}</p>
                <button onClick={() => { if(confirm('¿Confirmas rotación?')) { const r = plants.filter(p => p.level !== 3).map(p => ({ ...p, level: p.level + 1 })); setPlants(r); setLastRotation(new Date().toISOString()); } }} className="mt-6 w-full bg-green-600 px-6 py-4 rounded-2xl font-black uppercase text-xs shadow-lg">Rotar Cultivo Hoy</button>
             </Card>
          </TabsContent>

          <TabsContent value="tips" className="space-y-4 pb-10">
            <h2 className="text-xl font-black italic text-slate-800 ml-2 mb-4 uppercase tracking-tighter text-center">Sabiduría Maestra</h2>
            <Card className="p-6 rounded-[2.5rem] bg-white border-2 border-green-100 shadow-sm leading-relaxed text-[11px] font-medium text-slate-600">
              <div className="flex items-center gap-3 mb-3 text-green-600 font-black uppercase text-[10px] tracking-tighter"><Sprout size={18}/> Limpieza de Plántula</div>
              • Agua templada (20-24°C) para evitar shock.<br/>• Agita el cepellón suavemente. ¡No tires de las raíces!<br/>• OJO: Una gota de agua oxigenada elimina hongos de raíz.
            </Card>
            <Card className="p-6 rounded-[2.5rem] bg-slate-900 text-white shadow-xl">
              <div className="flex items-center gap-3 mb-4 text-yellow-400 font-black uppercase text-[10px] tracking-tighter"><Activity size={18}/> Tabla Maestra de Mezcla</div>
              <div className="grid grid-cols-3 text-[10px] font-bold border-t border-slate-700 pt-3 gap-y-3 uppercase tracking-tighter">
                <span className="text-slate-500">FASE</span><span className="text-center text-slate-500">pH</span><span className="text-right text-slate-500">EC</span>
                <span>Adaptación</span><span className="text-center text-green-400">5.8</span><span className="text-right text-green-400">0.8</span>
                <span className="text-yellow-400">PUNTO DULCE</span><span className="text-center text-yellow-400">6.0</span><span className="text-right text-yellow-400">1.4</span>
                <span>Máxima</span><span className="text-center text-blue-400">6.1</span><span className="text-right text-blue-400">1.6</span>
              </div>
            </Card>
            <Card className="p-6 rounded-[2.5rem] bg-white border-2 border-orange-100 shadow-sm leading-relaxed text-[11px] font-medium text-slate-600 text-center italic font-black uppercase">
              24h antes de cosechar, usa solo agua pura para un sabor 100% dulce y crujiente.
            </Card>
          </TabsContent>

          <TabsContent value="history" className="space-y-3">
             <h2 className="text-xl font-black italic text-slate-800 ml-2 mb-4 text-center">HISTORIAL DE MEDICIONES</h2>
             {history.length === 0 && <p className="text-center text-slate-300 font-black uppercase text-[10px] mt-10 tracking-widest italic">No hay registros almacenados</p>}
             {history.map(h => (
                <Card key={h.id} className="p-5 rounded-[2rem] bg-white border-2 font-black shadow-sm flex flex-col gap-2">
                  <div className="flex justify-between items-center border-b pb-2 mb-1">
                    <span className="text-[8px] text-slate-400">{h.date}</span>
                    <Badge className="bg-blue-600 text-white text-[9px] px-3">{h.waterVol}L</Badge>
                  </div>
                  <div className="flex justify-around text-xs italic">
                    <span className="flex items-center gap-1 text-slate-800 underline decoration-purple-500 decoration-2">pH {h.pH}</span>
                    <span className="flex items-center gap-1 text-emerald-600 underline decoration-emerald-500 decoration-2">EC {h.ec}</span>
                    <span className="text-orange-400 font-black">{h.temp}°C</span>
                  </div>
                </Card>
             ))}
          </TabsContent>

          <TabsContent value="settings" className="py-10">
             <button onClick={() => {if(confirm('¿BORRAR TODO?')) {localStorage.removeItem("hydroCaru_FULL_V6"); window.location.reload();}}} className="w-full bg-red-100 text-red-600 p-10 rounded-[3rem] font-black uppercase text-xs tracking-widest border-2 border-red-200 shadow-lg active:bg-red-200">Reset de Fábrica</button>
             <p className="text-center mt-6 text-[8px] font-black text-slate-300 tracking-widest uppercase italic">HydroCaru v6.0 Ultimate Full Edition</p>
          </TabsContent>
        </Tabs>
      </main>

      <SelectorPopUp />
    </div>
  );
}
