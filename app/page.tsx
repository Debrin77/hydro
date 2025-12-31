"use client"

import React, { useState, useEffect } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { 
  Sprout, Activity, Layers, Beaker, Calendar, 
  History, Plus, Trash2, FlaskConical, CheckCircle2, 
  ArrowDownCircle, ArrowUpCircle, AlertTriangle, Clock, Droplets
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
  
  const [params, setParams] = useState({ 
    pH: "6.0", ec: "1.2", waterVol: "20"
  });

  // --- PERSISTENCIA ---
  useEffect(() => {
    const saved = localStorage.getItem("hydroCaru_Ultra_Final");
    if (saved) {
      const d = JSON.parse(saved);
      if (d.isSetupComplete) {
        setIsSetupComplete(true);
        setPlants(d.plants || []);
        setParams(d.params);
        setHistory(d.history || []);
      }
    }
  }, []);

  useEffect(() => {
    if (isSetupComplete) {
      localStorage.setItem("hydroCaru_Ultra_Final", JSON.stringify({ isSetupComplete, plants, params, history }));
    }
  }, [isSetupComplete, plants, params, history]);

  // --- LÓGICA DE CORRECCIÓN (SIN FILTROS, SIEMPRE ACTIVA) ---
  const currentPH = parseFloat(params.pH) || 0;
  const currentEC = parseFloat(params.ec) || 0;
  const vol = parseFloat(params.waterVol) || 20;

  // Cálculo Nutrientes
  const targetEC = 1.4;
  const diffEC = targetEC - currentEC;
  const mlNutrientes = diffEC > 0 ? (diffEC / 0.1) * vol * 0.25 : 0;

  // Cálculo pH (Si no es 6.0, calcula)
  let phCorrection = { type: "", ml: 0, color: "" };
  if (currentPH > 6.2) {
    phCorrection = { type: "pH DOWN (Ácido)", ml: (currentPH - 6.0) * vol * 0.1, color: "bg-purple-600" };
  } else if (currentPH < 5.8 && currentPH > 0) {
    phCorrection = { type: "pH UP (Base)", ml: (6.0 - currentPH) * vol * 0.1, color: "bg-orange-500" };
  }

  const saveEntry = () => {
    setHistory([{ ...params, date: new Date().toLocaleString(), id: Date.now() }, ...history]);
    setActiveTab("history");
  };

  if (!isSetupComplete) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4">
        <Card className="w-full max-w-md p-8 bg-white rounded-[3rem] shadow-2xl space-y-6">
          <h2 className="text-3xl font-black text-center italic tracking-tighter">HydroCaru</h2>
          {setupStep === 1 ? (
            <div className="space-y-4">
              <p className="text-center text-slate-400 font-bold uppercase text-xs">Paso 1: Capacidad</p>
              <input type="text" value={params.waterVol} onChange={e => setParams({...params, waterVol: e.target.value})} className="w-full p-6 bg-slate-50 border-2 rounded-3xl text-center text-4xl font-black focus:border-green-500 outline-none" placeholder="Litros" />
              <button onClick={() => setSetupStep(2)} className="w-full bg-green-600 text-white p-6 rounded-3xl font-black">SIGUIENTE</button>
            </div>
          ) : (
            <div className="space-y-4">
              <p className="text-center text-slate-400 font-bold uppercase text-xs">Paso 2: Plántulas ({plants.length}/6)</p>
              <div className="grid grid-cols-3 gap-2">
                {[1,2,3,4,5,6].map(i => (
                  <div key={i} className={`aspect-square rounded-2xl border-2 flex items-center justify-center ${plants.length >= i ? 'bg-green-500 text-white' : 'bg-slate-50 text-slate-200 border-dashed'}`}><Sprout /></div>
                ))}
              </div>
              <select onChange={(e) => setPlants([...plants, {id: Date.now(), variety: e.target.value, level: 1, position: plants.length+1}])} className="w-full p-4 bg-slate-100 rounded-2xl font-black outline-none">
                <option value="">Añadir Variedad...</option>
                {Object.keys(VARIETY_CONFIG).map(v => <option key={v} value={v}>{v}</option>)}
              </select>
              <button disabled={plants.length < 6} onClick={() => setIsSetupComplete(true)} className="w-full bg-slate-900 text-white p-6 rounded-3xl font-black disabled:opacity-20">EMPEZAR CULTIVO</button>
            </div>
          )}
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 pb-36 font-sans">
      <header className="bg-white border-b p-6 sticky top-0 z-50 flex justify-between items-center shadow-sm">
        <div className="flex items-center gap-2 font-black text-green-600 text-2xl italic tracking-tighter"><Sprout /> HydroCaru</div>
        <Badge className="bg-slate-900 text-white rounded-full px-4 font-black">{params.waterVol}L</Badge>
      </header>

      <main className="container mx-auto p-4 max-w-md">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid grid-cols-6 h-16 bg-white border shadow-2xl rounded-2xl p-1 mb-8">
            <TabsTrigger value="overview"><Activity /></TabsTrigger>
            <TabsTrigger value="measure"><Beaker /></TabsTrigger>
            <TabsTrigger value="tower"><Layers /></TabsTrigger>
            <TabsTrigger value="calendar"><Calendar /></TabsTrigger>
            <TabsTrigger value="history"><History /></TabsTrigger>
            <TabsTrigger value="settings"><Trash2 /></TabsTrigger>
          </TabsList>

          {/* RESUMEN: CORRECCIONES SIEMPRE VISIBLES */}
          <TabsContent value="overview" className="space-y-4">
            {mlNutrientes > 0 && (
              <Card className="bg-blue-600 text-white p-6 rounded-[2.5rem] shadow-xl flex items-center gap-6 animate-in zoom-in">
                <FlaskConical className="w-10 h-10" />
                <div>
                  <p className="text-[10px] font-black uppercase opacity-80">Añadir Hy-Pro A+B</p>
                  <p className="text-4xl font-black">{mlNutrientes.toFixed(1)} ml</p>
                </div>
              </Card>
            )}

            {phCorrection.ml > 0 && (
              <Card className={`${phCorrection.color} text-white p-6 rounded-[2.5rem] shadow-xl flex items-center gap-6 animate-in zoom-in`}>
                {currentPH > 6.2 ? <ArrowDownCircle className="w-10 h-10" /> : <ArrowUpCircle className="w-10 h-10" />}
                <div>
                  <p className="text-[10px] font-black uppercase opacity-80">{phCorrection.type}</p>
                  <p className="text-4xl font-black">{phCorrection.ml.toFixed(1)} ml</p>
                </div>
              </Card>
            )}

            <div className="grid grid-cols-2 gap-4">
              <div className="bg-white p-8 rounded-[2.5rem] text-center shadow-sm border-2">
                <p className="text-[10px] font-black text-slate-400 uppercase mb-2">pH</p>
                <p className={`text-5xl font-black ${currentPH < 5.8 || currentPH > 6.2 ? 'text-red-500 animate-pulse' : 'text-slate-800'}`}>{params.pH}</p>
              </div>
              <div className="bg-white p-8 rounded-[2.5rem] text-center shadow-sm border-2">
                <p className="text-[10px] font-black text-slate-400 uppercase mb-2">EC</p>
                <p className="text-5xl font-black text-slate-800">{params.ec}</p>
              </div>
            </div>
          </TabsContent>

          {/* MEDICIÓN */}
          <TabsContent value="measure">
            <Card className="p-8 rounded-[3rem] space-y-6 shadow-2xl border-none">
              <h2 className="text-center font-black text-2xl italic underline decoration-green-500">Nuevos Niveles</h2>
              <div className="space-y-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-black text-slate-400 ml-4 uppercase">pH del depósito</label>
                  <input type="text" inputMode="decimal" value={params.pH} onChange={e => setParams({...params, pH: e.target.value})} className="w-full p-6 bg-slate-50 rounded-3xl text-center text-4xl font-black outline-none border-4 focus:border-green-500 transition-all" />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-black text-slate-400 ml-4 uppercase">EC (Nutrientes)</label>
                  <input type="text" inputMode="decimal" value={params.ec} onChange={e => setParams({...params, ec: e.target.value})} className="w-full p-6 bg-slate-50 rounded-3xl text-center text-4xl font-black outline-none border-4 focus:border-green-500 transition-all" />
                </div>
                <button onClick={saveEntry} className="w-full bg-slate-900 text-white p-7 rounded-[2rem] font-black text-xl shadow-lg active:scale-95 transition-all">REGISTRAR CAMBIOS</button>
              </div>
            </Card>
          </TabsContent>

          {/* TORRE */}
          <TabsContent value="tower" className="space-y-6">
            {[1, 2, 3].map(lvl => (
              <div key={lvl} className="bg-white p-6 rounded-[2.5rem] shadow-sm border">
                <p className="text-center text-[10px] font-black text-slate-300 uppercase tracking-widest mb-6">Nivel {lvl} {lvl === 1 ? '▲' : lvl === 3 ? '▼' : ''}</p>
                <div className="grid grid-cols-3 gap-6">
                  {[1, 2, 3, 4, 5, 6].map(pos => {
                    const p = plants.find(x => x.level === lvl && x.position === pos);
                    const config = p ? VARIETY_CONFIG[p.variety] : null;
                    return (
                      <button key={pos} onClick={() => p ? setPlants(plants.filter(id => id.id !== p.id)) : setPlants([...plants, {id: Date.now(), variety: "Romana", level: lvl, position: pos}])}
                        className={`w-full aspect-square rounded-[2rem] flex items-center justify-center border-2 transition-all shadow-sm ${p ? `${config?.bg} border-white shadow-md text-white` : 'bg-slate-50 border-dashed border-slate-200'}`}>
                        {p ? <Sprout className="w-8 h-8" /> : <Plus className="text-slate-200" />}
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}
          </TabsContent>

          {/* CALENDARIO RECOMENDADO */}
          <TabsContent value="calendar" className="space-y-4">
            <Card className="p-8 rounded-[2.5rem] shadow-sm space-y-6 border-none">
              <h3 className="font-black text-xl text-center italic uppercase underline decoration-amber-400">Tomas Recomendadas</h3>
              <div className="space-y-4">
                {[ {t: "08:00", d: "Mañana", c: "bg-amber-100 text-amber-700"}, {t: "14:00", d: "Mediodía", c: "bg-blue-100 text-blue-700"}, {t: "21:00", d: "Noche", c: "bg-indigo-100 text-indigo-700"} ].map(item => (
                  <div key={item.t} className="flex items-center gap-4 p-5 bg-slate-50 rounded-3xl border">
                    <div className={`${item.c} p-3 rounded-2xl font-black text-sm shadow-sm`}>{item.t}</div>
                    <div><p className="font-black text-sm uppercase">{item.d}</p><p className="text-[10px] text-slate-400 font-bold">Verificar pH/EC</p></div>
                  </div>
                ))}
              </div>
            </Card>
          </TabsContent>

          {/* HISTORIAL (PARA VER SI FUNCIONA) */}
          <TabsContent value="history" className="space-y-3">
            <h3 className="text-center text-[10px] font-black text-slate-400 uppercase tracking-widest">Registros de Medición</h3>
            {history.length === 0 && <p className="text-center text-slate-300 py-10 font-bold uppercase text-xs italic">No hay mediciones aún</p>}
            {history.map((h: any) => (
              <div key={h.id} className="bg-white p-5 rounded-3xl border shadow-sm flex justify-between items-center">
                <div>
                  <p className="text-[9px] font-black text-slate-300 uppercase leading-none mb-1">{h.date}</p>
                  <p className="font-black text-slate-800 text-lg tracking-tighter">pH {h.pH} | EC {h.ec}</p>
                </div>
                <Badge className="bg-green-100 text-green-700 border-none px-3 font-black">{h.waterVol}L</Badge>
              </div>
            ))}
          </TabsContent>

          {/* RESET */}
          <TabsContent value="settings" className="py-20 text-center">
            <button onClick={() => {localStorage.clear(); window.location.reload();}} className="w-full bg-red-100 text-red-600 p-10 rounded-[3rem] font-black border-2 border-red-200 uppercase text-xs tracking-[0.2em] shadow-sm">
              Limpiar todos los datos
            </button>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}
