"use client"

import React, { useState, useEffect } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { 
  Sprout, Activity, Layers, Beaker, Calendar, 
  History, Plus, Droplets, Thermometer, Trash2, 
  FlaskConical, AlertTriangle, CheckCircle2, ArrowDownCircle, ArrowUpCircle
} from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"

// --- CONFIGURACIÓN DE VARIEDADES Y COLORES ---
const VARIETY_CONFIG: { [key: string]: { color: string, bg: string } } = {
  "Romana": { color: "text-emerald-700", bg: "bg-emerald-400" },
  "Iceberg": { color: "text-blue-700", bg: "bg-blue-300" },
  "Hoja de Roble": { color: "text-red-700", bg: "bg-red-400" },
  "Lollo Rosso": { color: "text-purple-700", bg: "bg-purple-400" },
  "Trocadero": { color: "text-lime-700", bg: "bg-lime-400" }
};

const VARIETIES = Object.keys(VARIETY_CONFIG);

export default function HydroponicTowerApp() {
  const [isSetupComplete, setIsSetupComplete] = useState(false);
  const [activeTab, setActiveTab] = useState("overview");
  const [plants, setPlants] = useState<any[]>([]);
  const [history, setHistory] = useState<any[]>([]);
  
  const [params, setParams] = useState({ 
    pH: "6.0", ec: "1.2", waterVol: "20", waterTemp: "20", nutA: "500", nutB: "500" 
  });
  
  const [lastCleaning, setLastCleaning] = useState(new Date().toISOString());
  const [showPlantSelector, setShowPlantSelector] = useState<{lvl: number, pos: number} | null>(null);

  useEffect(() => {
    const saved = localStorage.getItem("hydroCaru_Final_Color_V6");
    if (saved) {
      try {
        const d = JSON.parse(saved);
        if (d.isSetupComplete) {
          setIsSetupComplete(true);
          setPlants(d.plants || []);
          setParams(d.params);
          setLastCleaning(d.lastCleaning);
          setHistory(d.history || []);
        }
      } catch (e) { console.error(e); }
    }
  }, []);

  useEffect(() => {
    if (isSetupComplete) {
      localStorage.setItem("hydroCaru_Final_Color_V6", JSON.stringify({ isSetupComplete, plants, params, lastCleaning, history }));
    }
  }, [isSetupComplete, plants, params, lastCleaning, history]);

  // --- LÓGICA DE CORRECCIÓN ---
  const nEC = parseFloat(params.ec) || 0;
  const nPH = parseFloat(params.pH) || 0;
  const nVol = parseFloat(params.waterVol) || 0;
  
  const recommendedEC = plants.length > 0 ? 1.6 : 1.2;
  const ecDiff = recommendedEC - nEC;
  const mlHyPro = ecDiff > 0.05 ? (ecDiff / 0.1) * nVol * 0.25 : 0;

  let phCorrection = { type: "", ml: 0 };
  if (nPH > 6.5) phCorrection = { type: "pH Down", ml: (nPH - 6.0) * nVol * 0.1 };
  else if (nPH < 5.5) phCorrection = { type: "pH Up", ml: (6.0 - nPH) * nVol * 0.1 };

  const daysSinceCleaning = Math.floor((Date.now() - new Date(lastCleaning).getTime()) / (1000 * 60 * 60 * 24));

  const saveMeasurement = () => {
    const newEntry = { ...params, date: new Date().toLocaleString(), id: Date.now() };
    setHistory([newEntry, ...history]);
    setActiveTab("overview");
  };

  if (!isSetupComplete) {
    return (
      <div className="min-h-screen bg-slate-100 flex items-center justify-center p-4">
        <Card className="w-full max-w-md p-8 space-y-6 shadow-2xl border-t-8 border-green-600 rounded-[2.5rem]">
          <h1 className="text-4xl font-black text-center italic tracking-tighter text-slate-800">HydroCaru</h1>
          <div className="space-y-4">
            <div className="space-y-1">
              <label className="text-[10px] font-black uppercase text-slate-400 ml-2">Depósito (L)</label>
              <input type="text" inputMode="decimal" value={params.waterVol} onChange={(e) => setParams({...params, waterVol: e.target.value})} className="w-full p-5 bg-slate-50 border-2 rounded-3xl font-black text-xl text-center" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <input type="text" placeholder="Stock A" value={params.nutA} onChange={(e) => setParams({...params, nutA: e.target.value})} className="w-full p-4 bg-slate-50 border-2 rounded-2xl font-bold text-center" />
              <input type="text" placeholder="Stock B" value={params.nutB} onChange={(e) => setParams({...params, nutB: e.target.value})} className="w-full p-4 bg-slate-50 border-2 rounded-2xl font-bold text-center" />
            </div>
          </div>
          <button onClick={() => setIsSetupComplete(true)} className="w-full bg-green-600 text-white p-6 rounded-3xl font-black shadow-xl">EMPEZAR</button>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 pb-36">
      <header className="bg-white border-b p-5 sticky top-0 z-50 flex justify-between items-center">
        <div className="flex items-center gap-2 font-black text-green-600 text-2xl italic tracking-tighter"><Sprout /> HydroCaru</div>
        <Badge className="bg-green-600 rounded-full">{params.waterVol}L</Badge>
      </header>

      <main className="container mx-auto p-4 max-w-md">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <div className="overflow-x-auto no-scrollbar mb-8">
            <TabsList className="flex w-max min-w-full h-16 bg-white border shadow-xl rounded-[1.5rem] p-1 gap-1">
              <TabsTrigger value="overview" className="px-5"><Activity /></TabsTrigger>
              <TabsTrigger value="measure" className="px-5"><Beaker /></TabsTrigger>
              <TabsTrigger value="tower" className="px-5"><Layers /></TabsTrigger>
              <TabsTrigger value="calendar" className="px-5"><Calendar /></TabsTrigger>
              <TabsTrigger value="history" className="px-5"><History /></TabsTrigger>
              <TabsTrigger value="settings" className="px-5"><Trash2 className="text-red-300" /></TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="overview" className="space-y-4">
            {mlHyPro > 0 && (
              <Card className="border-l-8 border-l-blue-600 bg-blue-50 shadow-md p-6 flex items-center gap-6 rounded-3xl">
                <FlaskConical className="text-blue-600 w-8 h-8" />
                <div>
                  <p className="text-[10px] font-black text-blue-600 uppercase">Hy-Pro A+B</p>
                  <p className="text-4xl font-black text-blue-950">{mlHyPro.toFixed(1)} ml</p>
                </div>
              </Card>
            )}

            {phCorrection.ml > 0 && (
              <Card className="border-l-8 border-l-purple-600 bg-purple-50 shadow-md p-6 flex items-center gap-6 rounded-3xl">
                {nPH > 6.5 ? <ArrowDownCircle className="text-purple-600 w-8 h-8" /> : <ArrowUpCircle className="text-purple-600 w-8 h-8" />}
                <div>
                  <p className="text-[10px] font-black text-purple-600 uppercase">{phCorrection.type}</p>
                  <p className="text-3xl font-black text-purple-950">{phCorrection.ml.toFixed(1)} ml</p>
                </div>
              </Card>
            )}

            <div className="grid grid-cols-2 gap-4">
              <div className="bg-white p-6 rounded-[2.5rem] shadow-sm text-center border-2 border-slate-50">
                <p className="text-[10px] font-black text-slate-300 mb-2 uppercase">pH</p>
                <p className={`text-5xl font-black ${nPH < 5.5 || nPH > 6.5 ? 'text-red-500' : 'text-slate-800'}`}>{params.pH}</p>
              </div>
              <div className="bg-white p-6 rounded-[2.5rem] shadow-sm text-center border-2 border-slate-50">
                <p className="text-[10px] font-black text-slate-300 mb-2 uppercase">EC</p>
                <p className="text-5xl font-black text-slate-800">{params.ec}</p>
              </div>
            </div>
          </TabsContent>

          {/* TORRE CORREGIDA (1 arriba, 3 abajo) */}
          <TabsContent value="tower" className="space-y-6">
            {[1, 2, 3].map(lvl => (
              <div key={lvl} className="bg-white p-6 rounded-[3rem] shadow-sm border border-slate-50">
                <p className="text-center text-[10px] font-black text-slate-200 uppercase tracking-[0.5em] mb-6">Nivel {lvl} {lvl === 1 ? '▲' : lvl === 3 ? '▼' : ''}</p>
                <div className="grid grid-cols-3 gap-6">
                  {[1, 2, 3, 4, 5, 6].map(pos => {
                    const p = plants.find(x => x.level === lvl && x.position === pos);
                    const config = p ? VARIETY_CONFIG[p.variety] : null;
                    return (
                      <button key={pos} onClick={() => p ? setPlants(plants.filter(id => id.id !== p.id)) : setShowPlantSelector({lvl, pos})}
                        className={`w-full aspect-square rounded-[2rem] flex flex-col items-center justify-center border-2 transition-all shadow-sm ${p ? `${config?.bg} border-white text-white shadow-lg` : 'bg-slate-50 border-dashed border-slate-200 text-slate-200'}`}>
                        {p ? (
                          <>
                            <Sprout className="w-7 h-7 mb-1" />
                            <span className="text-[6px] font-black uppercase tracking-tighter opacity-80">{p.variety.split(' ')[0]}</span>
                          </>
                        ) : <Plus className="w-6 h-6" />}
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}
          </TabsContent>

          <TabsContent value="measure">
            <Card className="p-8 rounded-[3rem] space-y-6 shadow-2xl border-none">
              <h2 className="font-black text-center text-2xl italic tracking-tighter underline decoration-green-500">Mediciones</h2>
              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-1"><label className="text-[10px] font-black text-slate-400 ml-4">pH</label>
                <input type="text" inputMode="decimal" value={params.pH} onChange={e => setParams({...params, pH: e.target.value})} className="w-full p-5 bg-slate-50 border-2 rounded-3xl font-black text-center text-2xl focus:border-green-500 outline-none" /></div>
                <div className="space-y-1"><label className="text-[10px] font-black text-slate-400 ml-4">EC</label>
                <input type="text" inputMode="decimal" value={params.ec} onChange={e => setParams({...params, ec: e.target.value})} className="w-full p-5 bg-slate-50 border-2 rounded-3xl font-black text-center text-2xl focus:border-green-500 outline-none" /></div>
                <div className="space-y-1"><label className="text-[10px] font-black text-slate-400 ml-4">Agua (L)</label>
                <input type="text" inputMode="decimal" value={params.waterVol} onChange={e => setParams({...params, waterVol: e.target.value})} className="w-full p-5 bg-slate-50 border-2 rounded-3xl font-black text-center text-2xl focus:border-green-500 outline-none" /></div>
                <div className="space-y-1"><label className="text-[10px] font-black text-slate-400 ml-4">Temp</label>
                <input type="text" inputMode="decimal" value={params.waterTemp} onChange={e => setParams({...params, waterTemp: e.target.value})} className="w-full p-5 bg-slate-50 border-2 rounded-3xl font-black text-center text-2xl focus:border-green-500 outline-none" /></div>
              </div>
              <button onClick={saveMeasurement} className="w-full bg-slate-900 text-white p-6 rounded-[2rem] font-black shadow-xl">GUARDAR MEDIDAS</button>
            </Card>
          </TabsContent>

          <TabsContent value="calendar" className="space-y-4">
            <Card className="p-8 rounded-[3rem] text-center space-y-4">
              <h3 className="font-black text-xl italic">Estado del Sistema</h3>
              <div className="p-5 bg-amber-50 rounded-2xl flex justify-between items-center border border-amber-100">
                <div className="text-left"><p className="text-xs font-black text-amber-800 uppercase leading-none">Última Limpieza</p><p className="text-[10px] text-amber-600">Día {daysSinceCleaning} de 14</p></div>
                <button onClick={() => setLastCleaning(new Date().toISOString())} className="bg-amber-500 text-white px-4 py-2 rounded-xl text-[10px] font-bold">RESET</button>
              </div>
              <div className="p-5 bg-slate-900 rounded-[2rem] text-white text-[11px] italic leading-relaxed">
                Recomendamos medir cada 24h para mantener la EC estable con {plants.length} plantas.
              </div>
            </Card>
          </TabsContent>

          <TabsContent value="history" className="space-y-3">
            {history.slice(0,10).map((h: any) => (
              <div key={h.id} className="bg-white p-5 rounded-3xl border border-slate-100 flex justify-between items-center">
                <div><p className="text-[9px] font-black text-slate-300 uppercase">{h.date}</p>
                <p className="font-black text-slate-800">pH {h.pH} · EC {h.ec}</p></div>
                <Badge variant="outline" className="text-[9px]">{h.waterVol}L</Badge>
              </div>
            ))}
          </TabsContent>

          <TabsContent value="settings" className="py-10 text-center">
            <button onClick={() => {localStorage.clear(); window.location.reload();}} className="w-full bg-red-50 text-red-600 p-8 rounded-[2.5rem] font-black border-2 border-red-100">RESET TOTAL</button>
          </TabsContent>
        </Tabs>
      </main>

      {showPlantSelector && (
        <div className="fixed inset-0 bg-slate-900/90 backdrop-blur-md z-[100] flex items-end justify-center">
          <div className="bg-white w-full max-w-md rounded-t-[4rem] p-12 space-y-4 animate-in slide-in-from-bottom">
            <h3 className="text-2xl font-black text-center tracking-tighter">¿Qué vas a plantar?</h3>
            <div className="grid grid-cols-1 gap-2">
              {VARIETIES.map(v => (
                <button key={v} onClick={() => { setPlants([...plants, {id: Date.now(), variety: v, level: showPlantSelector.lvl, position: showPlantSelector.pos}]); setShowPlantSelector(null); }} 
                  className={`w-full p-5 rounded-[1.5rem] font-black text-left flex justify-between items-center border-2 border-transparent hover:border-slate-900 ${VARIETY_CONFIG[v].bg} text-white shadow-sm`}>
                  {v} <Plus className="w-4 h-4" />
                </button>
              ))}
              <button onClick={() => setShowPlantSelector(null)} className="w-full p-4 text-slate-300 font-black uppercase text-[10px] mt-4">Cerrar</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
