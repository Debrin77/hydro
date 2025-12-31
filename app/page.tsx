"use client"

import React, { useState, useEffect } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { 
  Sprout, Activity, Layers, Beaker, Calendar, 
  History, Plus, Trash2, FlaskConical, 
  ArrowDownCircle, ArrowUpCircle, AlertTriangle, RefreshCw, Check
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
  
  const [params, setParams] = useState({ 
    pH: "6.0", ec: "1.2", waterVol: "20"
  });

  // --- PERSISTENCIA ---
  useEffect(() => {
    const saved = localStorage.getItem("hydroCaru_Final_V12");
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
      localStorage.setItem("hydroCaru_Final_V12", JSON.stringify({ isSetupComplete, plants, params, history, lastRotation }));
    }
  }, [isSetupComplete, plants, params, history, lastRotation]);

  // --- LÓGICA DE ROTACIÓN AUTOMÁTICA ---
  const checkRotationNeeded = () => {
    const last = new Date(lastRotation).getTime();
    const daysSince = (new Date().getTime() - last) / (1000 * 60 * 60 * 24);
    return daysSince >= 14;
  };

  const executeRotation = () => {
    // 1. Quitar Nivel 3 (Cosecha)
    let newPlants = plants.filter(p => p.level !== 3);
    // 2. Mover 2 -> 3
    newPlants = newPlants.map(p => p.level === 2 ? { ...p, level: 3 } : p);
    // 3. Mover 1 -> 2
    newPlants = newPlants.map(p => p.level === 1 ? { ...p, level: 2 } : p);
    
    setPlants(newPlants);
    setLastRotation(new Date().toISOString());
    setActiveTab("tower"); // Llevar al usuario a la torre para que añada las nuevas del Nivel 1
  };

  // --- LÓGICA DE CORRECCIÓN DINÁMICA ---
  const currentPH = parseFloat(params.pH) || 0;
  const currentEC = parseFloat(params.ec) || 0;
  const vol = parseFloat(params.waterVol) || 20;
  
  // Objetivo de EC sube según cantidad de plantas (más plantas = más comida)
  const targetEC = plants.length > 12 ? 1.6 : plants.length > 6 ? 1.4 : 1.2;
  const mlNutrientes = (targetEC - currentEC) > 0 ? ((targetEC - currentEC) / 0.1) * vol * 0.25 : 0;

  let phCorrection = { type: "", ml: 0, color: "" };
  if (currentPH > 6.2) {
    phCorrection = { type: "pH DOWN (Ácido)", ml: (currentPH - 6.0) * vol * 0.1, color: "bg-purple-600" };
  } else if (currentPH < 5.8 && currentPH > 0) {
    phCorrection = { type: "pH UP (Base)", ml: (6.0 - currentPH) * vol * 0.1, color: "bg-orange-500" };
  }

  const handlePlantClick = (lvl: number, pos: number) => {
    const exists = plants.find(p => p.level === lvl && p.position === pos);
    if (exists) {
      setPlants(plants.filter(p => p.id !== exists.id));
    } else {
      setShowPlantSelector({ lvl, pos });
    }
  };

  const renderLevel = (lvl: number) => (
    <div key={lvl} className="bg-white p-4 rounded-3xl border mb-4 shadow-sm">
      <div className="flex justify-between items-center mb-3 px-2">
        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
          {lvl === 1 ? 'Nivel 1: Plántulas' : lvl === 2 ? 'Nivel 2: Crecimiento' : 'Nivel 3: Cosecha'}
        </p>
        <Badge variant="outline" className="text-[8px] opacity-50">{plants.filter(p => p.level === lvl).length}/6</Badge>
      </div>
      <div className="grid grid-cols-3 gap-3">
        {[1, 2, 3, 4, 5, 6].map(pos => {
          const p = plants.find(x => x.level === lvl && x.position === pos);
          const config = p ? VARIETY_CONFIG[p.variety] : null;
          return (
            <button key={pos} type="button" onClick={() => handlePlantClick(lvl, pos)}
              className={`aspect-square rounded-2xl flex flex-col items-center justify-center border-2 transition-all ${p ? `${config?.bg} border-white text-white shadow-md` : 'bg-slate-50 border-dashed border-slate-200 text-slate-300'}`}>
              {p ? <Sprout className="w-6 h-6" /> : <Plus className="w-5 h-5" />}
              {p && <span className="text-[6px] font-black uppercase mt-1 leading-none text-center px-1">{p.variety}</span>}
            </button>
          );
        })}
      </div>
    </div>
  );

  if (!isSetupComplete) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4">
        <Card className="w-full max-w-md p-8 bg-white rounded-[3rem] shadow-2xl space-y-6">
          <h2 className="text-3xl font-black italic text-green-600 tracking-tighter text-center">HydroCaru</h2>
          {setupStep === 1 ? (
            <div className="space-y-4">
              <p className="text-center text-slate-400 font-bold uppercase text-xs tracking-tighter">Paso 1: Parámetros Iniciales</p>
              <div className="space-y-4">
                <div className="bg-slate-50 p-4 rounded-2xl border-2">
                   <span className="text-[9px] font-black text-slate-400 uppercase">Litros en Tanque</span>
                   <input type="text" value={params.waterVol} onChange={e => setParams({...params, waterVol: e.target.value})} className="w-full bg-transparent text-2xl font-black" />
                </div>
                <div className="bg-slate-50 p-4 rounded-2xl border-2">
                   <span className="text-[9px] font-black text-slate-400 uppercase">pH Agua</span>
                   <input type="text" value={params.pH} onChange={e => setParams({...params, pH: e.target.value})} className="w-full bg-transparent text-2xl font-black" />
                </div>
              </div>
              <button onClick={() => setSetupStep(2)} className="w-full bg-slate-900 text-white p-6 rounded-3xl font-black">CONTINUAR</button>
            </div>
          ) : (
            <div className="space-y-6">
              <p className="text-center text-slate-400 font-bold uppercase text-xs">Paso 2: Primeras 6 Plántulas</p>
              <div className="max-h-[300px] overflow-y-auto">{renderLevel(1)}</div>
              <button disabled={plants.length < 6} onClick={() => setIsSetupComplete(true)} className="w-full bg-green-600 text-white p-6 rounded-3xl font-black disabled:opacity-20">EMPEZAR CULTIVO</button>
            </div>
          )}
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 pb-32">
      <header className="bg-white border-b p-6 sticky top-0 z-50 flex justify-between items-center shadow-sm">
        <div className="font-black text-green-600 text-2xl italic tracking-tighter">HydroCaru</div>
        <div className="flex gap-2">
          <Badge className="bg-blue-100 text-blue-600 border-none font-black">{plants.length} Plantas</Badge>
          <Badge className="bg-slate-900 text-white rounded-full px-4">{params.waterVol}L</Badge>
        </div>
      </header>

      <main className="container mx-auto p-4 max-w-md">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid grid-cols-6 h-16 bg-white border shadow-xl rounded-2xl p-1 mb-8">
            <TabsTrigger value="overview"><Activity /></TabsTrigger>
            <TabsTrigger value="measure"><Beaker /></TabsTrigger>
            <TabsTrigger value="tower"><Layers /></TabsTrigger>
            <TabsTrigger value="calendar"><Calendar /></TabsTrigger>
            <TabsTrigger value="history"><History /></TabsTrigger>
            <TabsTrigger value="settings"><Trash2 /></TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-4">
            {checkRotationNeeded() && (
              <Card className="bg-red-600 text-white p-6 rounded-[2.5rem] shadow-xl border-none">
                <div className="flex items-start gap-4">
                  <RefreshCw className="w-10 h-10 shrink-0 animate-spin-slow" />
                  <div className="flex-1">
                    <p className="text-[10px] font-black uppercase mb-1">¡Toca Rotación y Nuevas Plantas!</p>
                    <p className="text-xs font-bold leading-tight opacity-90 mb-4">Mueve todo un nivel arriba y rellena el Nivel 1.</p>
                    <button onClick={executeRotation} className="w-full bg-white text-red-600 p-3 rounded-2xl font-black text-[10px] uppercase shadow-md flex items-center justify-center gap-2">
                      <Check className="w-4 h-4" /> Ejecutar Rotación Automática
                    </button>
                  </div>
                </div>
              </Card>
            )}

            <div className="grid grid-cols-1 gap-4">
              {mlNutrientes > 0 && (
                <Card className="bg-blue-600 text-white p-6 rounded-[2.5rem] flex items-center gap-6 shadow-lg border-none">
                  <FlaskConical className="w-10 h-10" />
                  <div><p className="text-[10px] font-black uppercase opacity-70">Añadir Nutrientes (Objetivo {targetEC} EC)</p><p className="text-4xl font-black">{mlNutrientes.toFixed(1)} ml</p></div>
                </Card>
              )}
              {phCorrection.ml > 0 && (
                <Card className={`${phCorrection.color} text-white p-6 rounded-[2.5rem] flex items-center gap-6 shadow-lg border-none`}>
                  {currentPH > 6.2 ? <ArrowDownCircle className="w-10 h-10" /> : <ArrowUpCircle className="w-10 h-10" />}
                  <div><p className="text-[10px] font-black uppercase opacity-70">{phCorrection.type}</p><p className="text-4xl font-black">{phCorrection.ml.toFixed(1)} ml</p></div>
                </Card>
              )}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="bg-white p-8 rounded-[2.5rem] border shadow-sm text-center">
                <p className="text-[10px] font-black text-slate-300 uppercase mb-1">pH Actual</p>
                <p className={`text-5xl font-black ${currentPH < 5.8 || currentPH > 6.2 ? 'text-red-500 animate-pulse' : 'text-slate-800'}`}>{params.pH}</p>
              </div>
              <div className="bg-white p-8 rounded-[2.5rem] border shadow-sm text-center">
                <p className="text-[10px] font-black text-slate-300 uppercase mb-1">EC Actual</p>
                <p className="text-5xl font-black text-slate-800">{params.ec}</p>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="measure">
            <Card className="p-8 rounded-[3rem] space-y-6 shadow-2xl border-none">
              <h2 className="text-center font-black text-2xl italic uppercase tracking-tighter text-slate-800">Nueva Medición</h2>
              <div className="space-y-4">
                <div className="bg-slate-50 p-5 rounded-3xl border-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase block mb-1">pH del agua</label>
                  <input type="text" inputMode="decimal" value={params.pH} onChange={e => setParams({...params, pH: e.target.value})} className="w-full bg-transparent text-4xl font-black outline-none" />
                </div>
                <div className="bg-slate-50 p-5 rounded-3xl border-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase block mb-1">EC (Nutrientes)</label>
                  <input type="text" inputMode="decimal" value={params.ec} onChange={e => setParams({...params, ec: e.target.value})} className="w-full bg-transparent text-4xl font-black outline-none" />
                </div>
                <div className="bg-blue-50/50 p-5 rounded-3xl border-2 border-blue-100">
                  <label className="text-[10px] font-black text-blue-400 uppercase block mb-1 text-center font-black animate-pulse">¿Cuántos litros hay ahora?</label>
                  <input type="text" inputMode="decimal" value={params.waterVol} onChange={e => setParams({...params, waterVol: e.target.value})} className="w-full bg-transparent text-4xl font-black outline-none text-center text-blue-600" />
                </div>
                <button onClick={() => { setHistory([{...params, id: Date.now(), date: new Date().toLocaleString()}, ...history]); setActiveTab("overview"); }} className="w-full bg-slate-900 text-white p-7 rounded-[2.5rem] font-black text-xl shadow-lg">CALCULAR DOSIS</button>
              </div>
            </Card>
          </TabsContent>

          <TabsContent value="tower" className="space-y-2">
            {[3, 2, 1].map(lvl => renderLevel(lvl))}
          </TabsContent>

          <TabsContent value="calendar" className="space-y-4 text-center">
             <Card className="p-8 rounded-[3rem] shadow-sm space-y-6 border-none">
              <h3 className="font-black text-xl italic uppercase underline decoration-amber-400">Recordatorios</h3>
              <div className="p-4 bg-blue-50 rounded-2xl border-2 border-blue-100 text-left space-y-2">
                <p className="text-[10px] font-black text-blue-700 uppercase">Estado del Cultivo:</p>
                <p className="text-xs font-bold text-blue-900 leading-tight">Tienes {plants.length} plantas. El sistema recomienda una EC de {targetEC}.</p>
              </div>
              <div className="p-4 bg-orange-50 rounded-2xl border-2 border-orange-100 text-left">
                <p className="text-[10px] font-black text-orange-700 uppercase">Día de Rotación:</p>
                <p className="text-xs font-bold text-orange-900 leading-tight">{new Date(new Date(lastRotation).getTime() + 14 * 86400000).toLocaleDateString()}</p>
              </div>
            </Card>
          </TabsContent>

          <TabsContent value="history" className="space-y-2">
            {history.map((h: any) => (
              <div key={h.id} className="bg-white p-5 rounded-3xl border shadow-sm flex justify-between items-center">
                <div><p className="text-[8px] font-black text-slate-300 uppercase mb-1">{h.date}</p><p className="font-black text-slate-800 text-lg">pH {h.pH} | EC {h.ec}</p></div>
                <Badge className="bg-green-100 text-green-700 border-none font-black">{h.waterVol}L</Badge>
              </div>
            ))}
          </TabsContent>

          <TabsContent value="settings" className="py-20 text-center">
             <button onClick={() => {localStorage.clear(); window.location.reload();}} className="w-full bg-red-100 text-red-600 p-10 rounded-[3rem] font-black border-2 border-red-200 uppercase text-xs tracking-widest">Borrar todos los datos</button>
          </TabsContent>
        </Tabs>
      </main>

      {showPlantSelector && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[110] flex items-end p-4">
          <div className="bg-white w-full max-w-md mx-auto rounded-[3rem] p-8 animate-in slide-in-from-bottom">
            <h3 className="text-center font-black uppercase mb-6 text-slate-400 text-xs">Añadir Nueva Plántula</h3>
            <div className="grid grid-cols-1 gap-2">
              {Object.keys(VARIETY_CONFIG).map(v => (
                <button key={v} onClick={() => { setPlants([...plants, {id: Date.now(), variety: v, level: showPlantSelector.lvl, position: showPlantSelector.pos}]); setShowPlantSelector(null); }} 
                  className={`w-full p-5 rounded-2xl font-black text-left flex justify-between items-center ${VARIETY_CONFIG[v].bg} text-white mb-1 shadow-sm`}>{v} <Plus className="w-5 h-5" /></button>
              ))}
              <button onClick={() => setShowPlantSelector(null)} className="w-full p-4 font-bold text-slate-300 uppercase text-[10px] mt-4">Cancelar</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
