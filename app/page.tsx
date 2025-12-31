"use client"

import React, { useState, useEffect } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { 
  Sprout, Activity, Layers, Beaker, Calendar, 
  History, Plus, Droplets, Thermometer, Trash2, 
  FlaskConical, AlertTriangle, CheckCircle2, Timer, ArrowDownCircle, ArrowUpCircle
} from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"

const VARIETIES = ["Romana", "Iceberg", "Hoja de Roble", "Lollo Rosso", "Trocadero"];

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
    const saved = localStorage.getItem("hydroCaru_Final_Pro_V5");
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
      localStorage.setItem("hydroCaru_Final_Pro_V5", JSON.stringify({ isSetupComplete, plants, params, lastCleaning, history }));
    }
  }, [isSetupComplete, plants, params, lastCleaning, history]);

  // --- LÓGICA DE CORRECCIÓN AVANZADA ---
  const nEC = parseFloat(params.ec) || 0;
  const nPH = parseFloat(params.pH) || 0;
  const nVol = parseFloat(params.waterVol) || 0;
  
  const recommendedEC = plants.length > 0 ? 1.6 : 1.2;
  const ecDiff = recommendedEC - nEC;
  const mlHyPro = ecDiff > 0.05 ? (ecDiff / 0.1) * nVol * 0.25 : 0;

  // Lógica pH: 1ml de pH Down suele bajar 0.5 puntos en 20L (ajustable)
  let phCorrection = { type: "", ml: 0 };
  if (nPH > 6.5) {
    phCorrection = { type: "pH Down (Ácido)", ml: (nPH - 6.0) * nVol * 0.1 };
  } else if (nPH < 5.5) {
    phCorrection = { type: "pH Up (Base)", ml: (6.0 - nPH) * nVol * 0.1 };
  }

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
          <h1 className="text-4xl font-black text-center italic tracking-tighter">HydroCaru</h1>
          <p className="text-center text-slate-400 font-bold uppercase text-[10px] tracking-widest">Configuración Inicial</p>
          <div className="space-y-4">
            <div className="space-y-1">
              <label className="text-[10px] font-black uppercase text-slate-400 ml-2">Capacidad Depósito (L)</label>
              <input type="text" inputMode="decimal" value={params.waterVol} onChange={(e) => setParams({...params, waterVol: e.target.value})} className="w-full p-5 bg-slate-50 border-2 rounded-3xl font-black text-xl text-center" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-[10px] font-black uppercase text-slate-400 ml-2">Stock A (ml)</label>
                <input type="text" value={params.nutA} onChange={(e) => setParams({...params, nutA: e.target.value})} className="w-full p-4 bg-slate-50 border-2 rounded-2xl font-bold text-center" />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-black uppercase text-slate-400 ml-2">Stock B (ml)</label>
                <input type="text" value={params.nutB} onChange={(e) => setParams({...params, nutB: e.target.value})} className="w-full p-4 bg-slate-50 border-2 rounded-2xl font-bold text-center" />
              </div>
            </div>
          </div>
          <button onClick={() => setIsSetupComplete(true)} className="w-full bg-green-600 text-white p-6 rounded-3xl font-black shadow-xl">INICIAR CULTIVO</button>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 pb-36">
      <header className="bg-white border-b p-5 sticky top-0 z-50 flex justify-between items-center shadow-sm">
        <div className="flex items-center gap-2 font-black text-green-600 text-2xl italic tracking-tighter"><Sprout /> HydroCaru</div>
        <Badge className="bg-green-600 px-4 py-1 rounded-full text-white">{params.waterVol}L</Badge>
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

          {/* 1. RESUMEN + CORRECCIÓN DE NUTRIENTES Y PH */}
          <TabsContent value="overview" className="space-y-4">
            {mlHyPro > 0 && (
              <Card className="border-l-8 border-l-blue-600 bg-blue-50 shadow-md p-6 flex items-center gap-6 rounded-3xl animate-in zoom-in">
                <div className="bg-blue-600 p-3 rounded-2xl"><FlaskConical className="text-white w-8 h-8" /></div>
                <div>
                  <p className="text-[10px] font-black text-blue-600 uppercase tracking-widest">Nutrientes Hy-Pro</p>
                  <p className="text-4xl font-black text-blue-950">{mlHyPro.toFixed(1)} ml <span className="text-sm font-normal text-blue-400">A+B</span></p>
                </div>
              </Card>
            )}

            {phCorrection.ml > 0 && (
              <Card className="border-l-8 border-l-purple-600 bg-purple-50 shadow-md p-6 flex items-center gap-6 rounded-3xl animate-in fade-in">
                <div className="bg-purple-600 p-3 rounded-2xl">
                  {nPH > 6.5 ? <ArrowDownCircle className="text-white w-8 h-8" /> : <ArrowUpCircle className="text-white w-8 h-8" />}
                </div>
                <div>
                  <p className="text-[10px] font-black text-purple-600 uppercase tracking-widest">Corregir pH</p>
                  <p className="text-3xl font-black text-purple-950">{phCorrection.ml.toFixed(1)} ml</p>
                  <p className="text-[10px] font-bold text-purple-400 uppercase">{phCorrection.type}</p>
                </div>
              </Card>
            )}

            <div className="grid grid-cols-2 gap-4">
              <div className="bg-white p-6 rounded-[2.5rem] shadow-sm text-center border-2 border-slate-50">
                <p className="text-[10px] font-black text-slate-300 mb-2 uppercase tracking-tighter">pH Actual</p>
                <p className={`text-5xl font-black ${nPH < 5.5 || nPH > 6.5 ? 'text-red-500' : 'text-slate-800'}`}>{params.pH}</p>
              </div>
              <div className="bg-white p-6 rounded-[2.5rem] shadow-sm text-center border-2 border-slate-50">
                <p className="text-[10px] font-black text-slate-300 mb-2 uppercase tracking-tighter">EC Actual</p>
                <p className="text-5xl font-black text-slate-800">{params.ec}</p>
              </div>
            </div>
          </TabsContent>

          {/* 2. MEDICIÓN */}
          <TabsContent value="measure">
            <Card className="p-8 rounded-[3rem] space-y-6 shadow-2xl border-none">
              <h2 className="font-black text-center text-2xl italic tracking-tighter">Laboratorio</h2>
              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase ml-4 tracking-widest">pH</label>
                  <input type="text" inputMode="decimal" value={params.pH} onChange={e => setParams({...params, pH: e.target.value})} className="w-full p-5 bg-slate-50 border-2 rounded-3xl font-black text-center text-2xl focus:border-green-500 outline-none" />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase ml-4 tracking-widest">EC</label>
                  <input type="text" inputMode="decimal" value={params.ec} onChange={e => setParams({...params, ec: e.target.value})} className="w-full p-5 bg-slate-50 border-2 rounded-3xl font-black text-center text-2xl focus:border-green-500 outline-none" />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase ml-4 tracking-widest">Agua (L)</label>
                  <input type="text" inputMode="decimal" value={params.waterVol} onChange={e => setParams({...params, waterVol: e.target.value})} className="w-full p-5 bg-slate-50 border-2 rounded-3xl font-black text-center text-2xl focus:border-green-500 outline-none" />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase ml-4 tracking-widest">Temp</label>
                  <input type="text" inputMode="decimal" value={params.waterTemp} onChange={e => setParams({...params, waterTemp: e.target.value})} className="w-full p-5 bg-slate-50 border-2 rounded-3xl font-black text-center text-2xl focus:border-green-500 outline-none" />
                </div>
              </div>
              <button onClick={saveMeasurement} className="w-full bg-slate-900 text-white p-6 rounded-[2rem] font-black text-lg shadow-xl active:scale-95 transition-all">GUARDAR MEDIDAS</button>
            </Card>
          </TabsContent>

          {/* 3. TORRE CON ICONOS DE PLANTA */}
          <TabsContent value="tower" className="space-y-6">
            {[3, 2, 1].map(lvl => (
              <div key={lvl} className="bg-white p-6 rounded-[3rem] shadow-sm border border-slate-50">
                <p className="text-center text-[10px] font-black text-slate-200 uppercase tracking-[0.5em] mb-6">Nivel {lvl}</p>
                <div className="grid grid-cols-3 gap-6">
                  {[1, 2, 3, 4, 5, 6].map(pos => {
                    const p = plants.find(x => x.level === lvl && x.position === pos);
                    return (
                      <button key={pos} onClick={() => p ? setPlants(plants.filter(id => id.id !== p.id)) : setShowPlantSelector({lvl, pos})}
                        className={`w-full aspect-square rounded-[2rem] flex items-center justify-center border-2 transition-all shadow-sm ${p ? 'bg-green-500 border-green-400 text-white animate-in zoom-in' : 'bg-slate-50 border-dashed border-slate-200 text-slate-200'}`}>
                        {p ? <Sprout className="w-8 h-8" /> : <Plus className="w-6 h-6" />}
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}
          </TabsContent>

          {/* 4. CALENDARIO DE MEDICIONES */}
          <TabsContent value="calendar" className="space-y-6">
            <Card className="p-8 rounded-[3rem] border-none shadow-sm space-y-6 text-center">
              <div className="inline-block p-4 bg-amber-50 rounded-full mb-2">
                <Calendar className="w-10 h-10 text-amber-500" />
              </div>
              <h3 className="font-black text-2xl tracking-tighter italic">Plan de Cultivo</h3>
              
              <div className="space-y-3">
                <div className="p-5 bg-green-50 border-2 border-green-100 rounded-3xl flex justify-between items-center">
                  <div className="text-left">
                    <p className="text-xs font-black text-green-700 uppercase">Medición pH/EC</p>
                    <p className="text-[10px] font-bold text-green-400">CADA 24 HORAS</p>
                  </div>
                  <CheckCircle2 className="text-green-500 w-8 h-8" />
                </div>
                
                <div className={`p-5 rounded-3xl border-2 flex items-center justify-between ${daysSinceCleaning >= 14 ? 'border-red-200 bg-red-50 animate-pulse' : 'border-slate-50 bg-slate-50'}`}>
                  <div className="text-left">
                    <p className="text-xs font-black uppercase text-slate-600">Limpieza Depósito</p>
                    <p className="text-[10px] text-slate-400 font-bold">Día {daysSinceCleaning} de 14</p>
                  </div>
                  <button onClick={() => setLastCleaning(new Date().toISOString())} className="bg-white px-4 py-2 rounded-xl text-[10px] font-black border shadow-sm">OK</button>
                </div>
              </div>

              <div className="p-6 bg-slate-900 rounded-[2rem] text-white">
                <p className="text-[10px] font-black text-slate-500 uppercase mb-2">Consejo HydroCaru</p>
                <p className="text-xs font-medium leading-relaxed italic">
                  "Con {plants.length} plantas activas, tus niveles de agua bajarán más rápido. Revisa el volumen cada 2 días."
                </p>
              </div>
            </Card>
          </TabsContent>

          {/* 5. HISTORIAL */}
          <TabsContent value="history" className="space-y-4">
            <h3 className="font-black text-center text-slate-400 uppercase text-[10px] tracking-widest mb-6">Últimos 10 registros</h3>
            {history.slice(0,10).map((h: any) => (
              <div key={h.id} className="bg-white p-5 rounded-3xl shadow-sm border border-slate-50 flex justify-between items-center">
                <div className="flex items-center gap-4">
                  <div className="bg-slate-50 p-2 rounded-xl"><Beaker className="w-5 h-5 text-slate-400" /></div>
                  <div>
                    <p className="text-[9px] font-black text-slate-300 uppercase leading-none mb-1">{h.date}</p>
                    <p className="font-black text-slate-800 tracking-tight text-lg">pH {h.pH} · EC {h.ec}</p>
                  </div>
                </div>
                <Badge variant="outline" className="rounded-lg font-black text-[10px]">{h.waterVol}L</Badge>
              </div>
            ))}
          </TabsContent>

          {/* 6. RESET */}
          <TabsContent value="settings" className="py-16 text-center">
            <button onClick={() => {localStorage.clear(); window.location.reload();}} className="w-full bg-red-50 text-red-600 p-10 rounded-[3rem] font-black border-2 border-red-100 hover:bg-red-600 hover:text-white transition-all shadow-sm group">
              <Trash2 className="mx-auto mb-4 w-10 h-10 group-hover:animate-bounce" />
              BORRAR TODO Y REINICIAR APP
            </button>
          </TabsContent>
        </Tabs>
      </main>

      {/* SELECTOR DE PLANTAS */}
      {showPlantSelector && (
        <div className="fixed inset-0 bg-slate-900/90 backdrop-blur-md z-[100] flex items-end justify-center">
          <div className="bg-white w-full max-w-md rounded-t-[4rem] p-12 space-y-6 animate-in slide-in-from-bottom duration-500">
            <h3 className="text-3xl font-black text-center tracking-tighter italic">Nueva Inquilina</h3>
            <div className="grid grid-cols-1 gap-3">
              {VARIETIES.map(v => (
                <button key={v} onClick={() => { setPlants([...plants, {id: Date.now(), variety: v, level: showPlantSelector.lvl, position: showPlantSelector.pos}]); setShowPlantSelector(null); }} 
                  className="w-full p-6 bg-slate-50 rounded-[2rem] font-black text-left border-2 border-transparent hover:border-green-500 hover:bg-green-50 transition-all flex justify-between items-center">
                  {v} <Plus className="w-5 h-5 text-green-500" />
                </button>
              ))}
              <button onClick={() => setShowPlantSelector(null)} className="w-full p-4 text-slate-300 font-black uppercase text-[10px] mt-4 tracking-[0.2em]">Cerrar</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
