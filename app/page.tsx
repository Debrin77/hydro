"use client"

import React, { useState, useEffect } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { 
  Sprout, Activity, Layers, Beaker, Calendar, 
  History, Plus, Trash2, FlaskConical, 
  ArrowDownCircle, ArrowUpCircle, AlertTriangle
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

  // --- PERSISTENCIA ---
  useEffect(() => {
    const saved = localStorage.getItem("hydroCaru_Final_V10");
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
      localStorage.setItem("hydroCaru_Final_V10", JSON.stringify({ isSetupComplete, plants, params, history }));
    }
  }, [isSetupComplete, plants, params, history]);

  // --- LÓGICA DE CORRECCIÓN ---
  const currentPH = parseFloat(params.pH) || 0;
  const currentEC = parseFloat(params.ec) || 0;
  const vol = parseFloat(params.waterVol) || 20;

  const mlNutrientes = (1.4 - currentEC) > 0 ? ((1.4 - currentEC) / 0.1) * vol * 0.25 : 0;

  let phCorrection = { type: "", ml: 0, color: "" };
  if (currentPH > 6.2) {
    phCorrection = { type: "pH DOWN (Ácido)", ml: (currentPH - 6.0) * vol * 0.1, color: "bg-purple-600" };
  } else if (currentPH < 5.8 && currentPH > 0) {
    phCorrection = { type: "pH UP (Base)", ml: (6.0 - currentPH) * vol * 0.1, color: "bg-orange-500" };
  }

  // --- FUNCIONES DE ACCIÓN ---
  const handlePlantClick = (lvl: number, pos: number) => {
    const exists = plants.find(p => p.level === lvl && p.position === pos);
    if (exists) {
      setPlants(plants.filter(p => p.id !== exists.id));
    } else {
      setShowPlantSelector({ lvl, pos });
    }
  };

  const confirmPlant = (variety: string) => {
    if (showPlantSelector) {
      const newPlant = {
        id: Date.now(),
        variety,
        level: showPlantSelector.lvl,
        position: showPlantSelector.pos
      };
      setPlants([...plants, newPlant]);
      setShowPlantSelector(null);
    }
  };

  // --- VISTA DE LA TORRE ---
  const renderLevel = (lvl: number) => (
    <div key={lvl} className="bg-white p-4 rounded-3xl border mb-4 shadow-sm">
      <p className="text-[9px] font-black text-slate-300 text-center uppercase mb-3">Nivel {lvl}</p>
      <div className="grid grid-cols-3 gap-3">
        {[1, 2, 3, 4, 5, 6].map(pos => {
          const p = plants.find(x => x.level === lvl && x.position === pos);
          const config = p ? VARIETY_CONFIG[p.variety] : null;
          return (
            <button 
              key={pos} 
              type="button"
              onClick={() => handlePlantClick(lvl, pos)}
              className={`aspect-square rounded-2xl flex flex-col items-center justify-center border-2 transition-all ${p ? `${config?.bg} border-white text-white shadow-md` : 'bg-slate-50 border-dashed border-slate-200 text-slate-300'}`}
            >
              {p ? <Sprout className="w-6 h-6" /> : <Plus className="w-5 h-5" />}
              {p && <span className="text-[6px] font-black uppercase mt-1">{p.variety.split(' ')[0]}</span>}
            </button>
          );
        })}
      </div>
    </div>
  );

  // --- INTERFAZ DE INICIO ---
  if (!isSetupComplete) {
    return (
      <div className="min-h-screen bg-slate-100 flex items-center justify-center p-4">
        <Card className="w-full max-w-md p-8 bg-white rounded-[3rem] shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-2 bg-slate-100">
            <div className={`h-full bg-green-500 transition-all ${setupStep === 1 ? 'w-1/2' : 'w-full'}`} />
          </div>

          {setupStep === 1 ? (
            <div className="space-y-6 pt-4">
              <h2 className="text-3xl font-black italic text-green-600 tracking-tighter">HydroCaru</h2>
              <p className="font-bold text-slate-400 text-sm uppercase">Configuración de Agua</p>
              <div className="space-y-4">
                <div className="bg-slate-50 p-4 rounded-2xl border-2">
                  <label className="text-[10px] font-black uppercase text-slate-400 block mb-1">Litros Depósito</label>
                  <input type="text" value={params.waterVol} onChange={e => setParams({...params, waterVol: e.target.value})} className="w-full bg-transparent text-3xl font-black outline-none" />
                </div>
                <div className="bg-slate-50 p-4 rounded-2xl border-2">
                  <label className="text-[10px] font-black uppercase text-slate-400 block mb-1">pH Inicial</label>
                  <input type="text" value={params.pH} onChange={e => setParams({...params, pH: e.target.value})} className="w-full bg-transparent text-3xl font-black outline-none" />
                </div>
              </div>
              <button onClick={() => setSetupStep(2)} className="w-full bg-slate-900 text-white p-6 rounded-3xl font-black shadow-lg">SIGUIENTE</button>
            </div>
          ) : (
            <div className="space-y-6 pt-4">
              <div className="flex justify-between items-end">
                <h2 className="text-2xl font-black italic">Plantar</h2>
                <Badge className="bg-green-600">{plants.length} / 6 mín.</Badge>
              </div>
              <p className="text-xs font-bold text-slate-400">Pulsa los huecos del Nivel 1 para añadir tus lechugas:</p>
              <div className="max-h-[300px] overflow-y-auto px-1">
                {renderLevel(1)}
              </div>
              <button disabled={plants.length < 6} onClick={() => setIsSetupComplete(true)} className="w-full bg-green-600 text-white p-6 rounded-3xl font-black disabled:opacity-20 shadow-xl">FINALIZAR</button>
            </div>
          )}
        </Card>

        {showPlantSelector && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[110] flex items-end p-4">
            <div className="bg-white w-full max-w-md mx-auto rounded-[3rem] p-8 animate-in slide-in-from-bottom">
              <h3 className="text-center font-black uppercase mb-4 text-slate-400 text-xs">Variedad de Lechuga</h3>
              <div className="grid grid-cols-1 gap-2">
                {Object.keys(VARIETY_CONFIG).map(v => (
                  <button key={v} onClick={() => confirmPlant(v)} className={`w-full p-5 rounded-2xl font-black text-left flex justify-between items-center ${VARIETY_CONFIG[v].bg} text-white`}>
                    {v} <Plus className="w-5 h-5" />
                  </button>
                ))}
                <button onClick={() => setShowPlantSelector(null)} className="w-full p-4 font-bold text-slate-300 uppercase text-[10px] mt-2">Cerrar</button>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  // --- PANEL PRINCIPAL ---
  return (
    <div className="min-h-screen bg-slate-50 pb-32">
      <header className="bg-white border-b p-6 sticky top-0 z-50 flex justify-between items-center shadow-sm">
        <div className="font-black text-green-600 text-2xl italic tracking-tighter">HydroCaru</div>
        <Badge className="bg-slate-900 text-white rounded-full px-4">{params.waterVol}L</Badge>
      </header>

      <main className="container mx-auto p-4 max-w-md">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid grid-cols-6 h-16 bg-white border shadow-xl rounded-2xl p-1 mb-8">
            <TabsTrigger value="overview"><Activity className="w-5 h-5" /></TabsTrigger>
            <TabsTrigger value="measure"><Beaker className="w-5 h-5" /></TabsTrigger>
            <TabsTrigger value="tower"><Layers className="w-5 h-5" /></TabsTrigger>
            <TabsTrigger value="calendar"><Calendar className="w-5 h-5" /></TabsTrigger>
            <TabsTrigger value="history"><History className="w-5 h-5" /></TabsTrigger>
            <TabsTrigger value="settings"><Trash2 className="w-5 h-5" /></TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-4">
            {mlNutrientes > 0 && (
              <Card className="bg-blue-600 text-white p-6 rounded-[2.5rem] flex items-center gap-6 shadow-lg">
                <FlaskConical className="w-10 h-10" />
                <div><p className="text-[10px] font-black uppercase opacity-70">Hy-Pro A+B</p><p className="text-4xl font-black">{mlNutrientes.toFixed(1)} ml</p></div>
              </Card>
            )}
            {phCorrection.ml > 0 && (
              <Card className={`${phCorrection.color} text-white p-6 rounded-[2.5rem] flex items-center gap-6 shadow-lg`}>
                {currentPH > 6.2 ? <ArrowDownCircle className="w-10 h-10" /> : <ArrowUpCircle className="w-10 h-10" />}
                <div><p className="text-[10px] font-black uppercase opacity-70">{phCorrection.type}</p><p className="text-4xl font-black">{phCorrection.ml.toFixed(1)} ml</p></div>
              </Card>
            )}
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-white p-8 rounded-[2.5rem] border shadow-sm text-center">
                <p className="text-[10px] font-black text-slate-300 uppercase mb-1">pH</p>
                <p className={`text-5xl font-black ${currentPH < 5.8 || currentPH > 6.2 ? 'text-red-500 animate-pulse' : 'text-slate-800'}`}>{params.pH}</p>
              </div>
              <div className="bg-white p-8 rounded-[2.5rem] border shadow-sm text-center">
                <p className="text-[10px] font-black text-slate-300 uppercase mb-1">EC</p>
                <p className="text-5xl font-black text-slate-800">{params.ec}</p>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="measure">
            <Card className="p-8 rounded-[3rem] space-y-6 shadow-xl border-none">
              <h2 className="text-center font-black text-2xl italic uppercase tracking-tighter">Muestra Depósito</h2>
              <div className="space-y-4">
                <div className="space-y-1"><label className="text-[10px] font-black text-slate-400 ml-4 uppercase">pH</label>
                  <input type="text" inputMode="decimal" value={params.pH} onChange={e => setParams({...params, pH: e.target.value})} className="w-full p-6 bg-slate-50 rounded-3xl text-center text-4xl font-black outline-none border-4 focus:border-green-500" />
                </div>
                <div className="space-y-1"><label className="text-[10px] font-black text-slate-400 ml-4 uppercase">EC</label>
                  <input type="text" inputMode="decimal" value={params.ec} onChange={e => setParams({...params, ec: e.target.value})} className="w-full p-6 bg-slate-50 rounded-3xl text-center text-4xl font-black outline-none border-4 focus:border-green-500" />
                </div>
                <button onClick={() => { setHistory([{...params, id: Date.now(), date: new Date().toLocaleString()}, ...history]); setActiveTab("overview"); }} className="w-full bg-slate-900 text-white p-7 rounded-[2.5rem] font-black text-xl shadow-lg">GUARDAR MEDIDA</button>
              </div>
            </Card>
          </TabsContent>

          <TabsContent value="tower" className="space-y-4">
            {[1, 2, 3].map(lvl => renderLevel(lvl))}
          </TabsContent>

          <TabsContent value="calendar" className="space-y-4 text-center">
            <Card className="p-8 rounded-[3rem] shadow-sm space-y-6">
              <h3 className="font-black text-xl italic uppercase underline decoration-amber-400">Tomas Diarias</h3>
              <div className="space-y-2">
                {[ {t: "08:00", d: "Mañana"}, {t: "14:00", d: "Mediodía"}, {t: "21:00", d: "Noche"} ].map(item => (
                  <div key={item.t} className="flex justify-between items-center p-4 bg-slate-50 rounded-2xl border">
                    <span className="font-black text-slate-800">{item.t}</span>
                    <span className="font-bold text-[10px] uppercase text-slate-400">{item.d}</span>
                  </div>
                ))}
              </div>
              <div className="p-4 bg-red-50 rounded-2xl border-2 border-red-100 flex items-center gap-3">
                <AlertTriangle className="text-red-500 w-5 h-5 shrink-0" />
                <p className="text-[9px] font-black text-red-700 uppercase text-left leading-tight">Limpieza completa y cambio de agua cada 14 días.</p>
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

          <TabsContent value="settings" className="py-20">
            <button onClick={() => {localStorage.clear(); window.location.reload();}} className="w-full bg-red-100 text-red-600 p-10 rounded-[3rem] font-black border-2 border-red-200 uppercase text-xs">Resetear Todo</button>
          </TabsContent>
        </Tabs>
      </main>

      {showPlantSelector && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[110] flex items-end p-4">
          <div className="bg-white w-full max-w-md mx-auto rounded-[3rem] p-8 animate-in slide-in-from-bottom">
            <h3 className="text-center font-black uppercase mb-4 text-slate-400 text-xs">Variedad de Lechuga</h3>
            <div className="grid grid-cols-1 gap-2">
              {Object.keys(VARIETY_CONFIG).map(v => (
                <button key={v} onClick={() => confirmPlant(v)} className={`w-full p-5 rounded-2xl font-black text-left flex justify-between items-center ${VARIETY_CONFIG[v].bg} text-white`}>
                  {v} <Plus className="w-5 h-5" />
                </button>
              ))}
              <button onClick={() => setShowPlantSelector(null)} className="w-full p-4 font-bold text-slate-300 uppercase text-[10px] mt-2">Cerrar</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
