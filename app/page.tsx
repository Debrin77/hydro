"use client"

import React, { useState, useEffect } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { 
  Sprout, Activity, Layers, Beaker, Calendar, 
  History, Plus, Trash2, FlaskConical, CheckCircle2, 
  ArrowDownCircle, ArrowUpCircle, AlertTriangle, Clock
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
  const [showPlantSelector, setShowPlantSelector] = useState<{lvl: number, pos: number} | null>(null);
  
  const [params, setParams] = useState({ 
    pH: "6.0", ec: "1.2", waterVol: "20"
  });

  // --- CARGA Y GUARDADO ---
  useEffect(() => {
    const saved = localStorage.getItem("hydroCaru_Final_V9");
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
      localStorage.setItem("hydroCaru_Final_V9", JSON.stringify({ isSetupComplete, plants, params, history }));
    }
  }, [isSetupComplete, plants, params, history]);

  // --- LÓGICA DE CORRECCIÓN BLINDADA ---
  const currentPH = parseFloat(params.pH) || 0;
  const currentEC = parseFloat(params.ec) || 0;
  const vol = parseFloat(params.waterVol) || 20;

  const targetEC = 1.4;
  const diffEC = targetEC - currentEC;
  const mlNutrientes = diffEC > 0 ? (diffEC / 0.1) * vol * 0.25 : 0;

  let phCorrection = { type: "", ml: 0, color: "" };
  if (currentPH > 6.2) {
    phCorrection = { type: "pH DOWN (Ácido)", ml: (currentPH - 6.0) * vol * 0.1, color: "bg-purple-600" };
  } else if (currentPH < 5.8 && currentPH > 0) {
    phCorrection = { type: "pH UP (Base)", ml: (6.0 - currentPH) * vol * 0.1, color: "bg-orange-500" };
  }

  const saveEntry = () => {
    setHistory([{ ...params, date: new Date().toLocaleString(), id: Date.now() }, ...history]);
    setActiveTab("overview");
  };

  const handlePlantClick = (lvl: number, pos: number) => {
    const existing = plants.find(p => p.level === lvl && p.position === pos);
    if (existing) {
      setPlants(plants.filter(p => p.id !== existing.id));
    } else {
      setShowPlantSelector({ lvl, pos });
    }
  };

  const addPlant = (variety: string) => {
    if (showPlantSelector) {
      setPlants([...plants, { 
        id: Date.now(), 
        variety, 
        level: showPlantSelector.lvl, 
        position: showPlantSelector.pos 
      }]);
      setShowPlantSelector(null);
    }
  };

  // --- COMPONENTE DE LA TORRE (REUTILIZABLE) ---
  const TowerView = () => (
    <div className="space-y-6">
      {[1, 2, 3].map(lvl => (
        <div key={lvl} className="bg-white p-6 rounded-[2.5rem] shadow-sm border border-slate-100">
          <p className="text-center text-[10px] font-black text-slate-300 uppercase tracking-widest mb-6">Nivel {lvl} {lvl === 1 ? '▲' : lvl === 3 ? '▼' : ''}</p>
          <div className="grid grid-cols-3 gap-4">
            {[1, 2, 3, 4, 5, 6].map(pos => {
              const p = plants.find(x => x.level === lvl && x.position === pos);
              const config = p ? VARIETY_CONFIG[p.variety] : null;
              return (
                <button key={pos} onClick={() => handlePlantClick(lvl, pos)}
                  className={`w-full aspect-square rounded-2xl flex flex-col items-center justify-center border-2 transition-all ${p ? `${config?.bg} border-white shadow-md text-white` : 'bg-slate-50 border-dashed border-slate-200 text-slate-200'}`}>
                  {p ? <Sprout className="w-7 h-7" /> : <Plus />}
                  {p && <span className="text-[6px] font-black mt-1 uppercase">{p.variety.split(' ')[0]}</span>}
                </button>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );

  if (!isSetupComplete) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4">
        <Card className="w-full max-w-md p-8 bg-white rounded-[3rem] shadow-2xl space-y-6">
          <h2 className="text-3xl font-black text-center italic tracking-tighter text-green-600">HydroCaru</h2>
          {setupStep === 1 ? (
            <div className="space-y-6">
              <p className="text-center text-slate-400 font-bold uppercase text-xs tracking-widest">Paso 1: Configura el Agua</p>
              <div className="space-y-4">
                <div className="space-y-1">
                  <span className="text-[10px] font-black ml-2 uppercase text-slate-400">Litros en Depósito</span>
                  <input type="text" value={params.waterVol} onChange={e => setParams({...params, waterVol: e.target.value})} className="w-full p-5 bg-slate-50 border-2 rounded-2xl text-center text-2xl font-black" />
                </div>
                <div className="space-y-1">
                  <span className="text-[10px] font-black ml-2 uppercase text-slate-400">pH Inicial del Agua</span>
                  <input type="text" value={params.pH} onChange={e => setParams({...params, pH: e.target.value})} className="w-full p-5 bg-slate-50 border-2 rounded-2xl text-center text-2xl font-black" />
                </div>
              </div>
              <button onClick={() => setSetupStep(2)} className="w-full bg-slate-900 text-white p-5 rounded-2xl font-black">SIGUIENTE</button>
            </div>
          ) : (
            <div className="space-y-6">
              <p className="text-center text-slate-400 font-bold uppercase text-xs tracking-widest">Paso 2: Pulsa huecos para plantar ({plants.length}/6 mín.)</p>
              <div className="max-h-[350px] overflow-y-auto pr-2 custom-scrollbar">
                <TowerView />
              </div>
              <button disabled={plants.length < 6} onClick={() => setIsSetupComplete(true)} className="w-full bg-green-600 text-white p-6 rounded-3xl font-black disabled:opacity-30 shadow-lg">FINALIZAR CONFIGURACIÓN</button>
            </div>
          )}
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 pb-36">
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

          <TabsContent value="overview" className="space-y-4">
            {mlNutrientes > 0 && (
              <Card className="bg-blue-600 text-white p-6 rounded-[2.5rem] shadow-xl flex items-center gap-6">
                <FlaskConical className="w-10 h-10" />
                <div><p className="text-[10px] font-black uppercase opacity-80 leading-none">Añadir Nutrientes</p><p className="text-4xl font-black">{mlNutrientes.toFixed(1)} ml</p></div>
              </Card>
            )}

            {phCorrection.ml > 0 && (
              <Card className={`${phCorrection.color} text-white p-6 rounded-[2.5rem] shadow-xl flex items-center gap-6`}>
                {currentPH > 6.2 ? <ArrowDownCircle className="w-10 h-10" /> : <ArrowUpCircle className="w-10 h-10" />}
                <div><p className="text-[10px] font-black uppercase opacity-80 leading-none">{phCorrection.type}</p><p className="text-4xl font-black">{phCorrection.ml.toFixed(1)} ml</p></div>
              </Card>
            )}

            <div className="grid grid-cols-2 gap-4">
              <div className="bg-white p-8 rounded-[2.5rem] text-center shadow-sm border-2">
                <p className="text-[10px] font-black text-slate-400 uppercase mb-2 leading-none">pH</p>
                <p className={`text-5xl font-black ${currentPH < 5.8 || currentPH > 6.2 ? 'text-red-500 animate-pulse' : 'text-slate-800'}`}>{params.pH}</p>
              </div>
              <div className="bg-white p-8 rounded-[2.5rem] text-center shadow-sm border-2">
                <p className="text-[10px] font-black text-slate-400 uppercase mb-2 leading-none">EC</p>
                <p className="text-5xl font-black text-slate-800">{params.ec}</p>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="measure">
            <Card className="p-8 rounded-[3rem] space-y-6 shadow-2xl border-none">
              <h2 className="text-center font-black text-2xl italic">Muestra del Depósito</h2>
              <div className="space-y-4">
                <div className="space-y-1"><label className="text-[10px] font-black text-slate-400 ml-4 uppercase">pH</label>
                  <input type="text" inputMode="decimal" value={params.pH} onChange={e => setParams({...params, pH: e.target.value})} className="w-full p-6 bg-slate-50 rounded-3xl text-center text-4xl font-black outline-none border-4 focus:border-green-500 transition-all" />
                </div>
                <div className="space-y-1"><label className="text-[10px] font-black text-slate-400 ml-4 uppercase">EC</label>
                  <input type="text" inputMode="decimal" value={params.ec} onChange={e => setParams({...params, ec: e.target.value})} className="w-full p-6 bg-slate-50 rounded-3xl text-center text-4xl font-black outline-none border-4 focus:border-green-500 transition-all" />
                </div>
                <button onClick={saveEntry} className="w-full bg-slate-900 text-white p-7 rounded-[2rem] font-black text-xl shadow-lg">REGISTRAR</button>
              </div>
            </Card>
          </TabsContent>

          <TabsContent value="tower">
            <TowerView />
          </TabsContent>

          <TabsContent value="calendar" className="space-y-4">
            <Card className="p-8 rounded-[2.5rem] shadow-sm space-y-6 border-none text-center">
              <h3 className="font-black text-xl italic uppercase underline decoration-amber-400">Tomas Diarias</h3>
              <div className="space-y-3">
                {[ {t: "08:00", d: "Mañana"}, {t: "14:00", d: "Mediodía"}, {t: "21:00", d: "Noche"} ].map(item => (
                  <div key={item.t} className="flex justify-between items-center p-5 bg-slate-50 rounded-3xl border">
                    <span className="font-black text-slate-800">{item.t}</span>
                    <span className="font-bold text-xs uppercase text-slate-400">{item.d}</span>
                  </div>
                ))}
              </div>
              <div className="p-4 bg-red-50 rounded-2xl border-2 border-red-100 flex items-center gap-3">
                <AlertTriangle className="text-red-500 w-5 h-5" />
                <p className="text-[10px] font-black text-red-700 uppercase">Cambio total de agua cada 14 días.</p>
              </div>
            </Card>
          </TabsContent>

          <TabsContent value="history" className="space-y-3">
            {history.map((h: any) => (
              <div key={h.id} className="bg-white p-5 rounded-3xl border shadow-sm flex justify-between items-center">
                <div><p className="text-[8px] font-black text-slate-300 uppercase">{h.date}</p><p className="font-black text-slate-800">pH {h.pH} | EC {h.ec}</p></div>
                <Badge className="bg-green-100 text-green-700 border-none font-black">{h.waterVol}L</Badge>
              </div>
            ))}
          </TabsContent>

          <TabsContent value="settings" className="py-10 text-center">
            <button onClick={() => {localStorage.clear(); window.location.reload();}} className="w-full bg-red-100 text-red-600 p-8 rounded-[2rem] font-black border-2 border-red-200 uppercase text-xs">Resetear Todo</button>
          </TabsContent>
        </Tabs>
      </main>

      {/* SELECTOR DE PLANTA (MODAL) */}
      {showPlantSelector && (
        <div className="fixed inset-0 bg-slate-900/95 backdrop-blur-md z-[100] flex items-end justify-center p-4">
          <div className="bg-white w-full max-w-md rounded-[3rem] p-10 space-y-4 animate-in slide-in-from-bottom">
            <h3 className="text-xl font-black text-center uppercase tracking-tighter">Variedad para Nivel {showPlantSelector.lvl}</h3>
            <div className="grid grid-cols-1 gap-2">
              {Object.keys(VARIETY_CONFIG).map(v => (
                <button key={v} onClick={() => addPlant(v)} className={`w-full p-5 rounded-2xl font-black text-left flex justify-between items-center ${VARIETY_CONFIG[v].bg} text-white shadow-sm hover:scale-105 transition-transform`}>
                  {v} <Plus className="w-5 h-5" />
                </button>
              ))}
              <button onClick={() => setShowPlantSelector(null)} className="w-full p-4 text-slate-300 font-bold uppercase text-[10px] mt-4">Cancelar</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
