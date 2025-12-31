"use client"

import React, { useState, useEffect } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { 
  Sprout, Activity, Layers, Beaker, Calendar, 
  History, Plus, Droplets, Thermometer, Trash2, 
  FlaskConical, AlertTriangle, CheckCircle2, Timer
} from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"

const VARIETIES = ["Romana", "Iceberg", "Hoja de Roble", "Lollo Rosso", "Trocadero"];

export default function HydroponicTowerApp() {
  const [isSetupComplete, setIsSetupComplete] = useState(false);
  const [activeTab, setActiveTab] = useState("overview");
  const [plants, setPlants] = useState<any[]>([]);
  const [history, setHistory] = useState<any[]>([]);
  
  // Parámetros con soporte de decimales (Strings para evitar saltos de cursor)
  const [params, setParams] = useState({ 
    pH: "6.0", ec: "1.2", waterVol: "20", waterTemp: "20", nutA: "500", nutB: "500" 
  });
  
  const [lastCleaning, setLastCleaning] = useState(new Date().toISOString());
  const [showPlantSelector, setShowPlantSelector] = useState<{lvl: number, pos: number} | null>(null);

  // --- PERSISTENCIA ---
  useEffect(() => {
    const saved = localStorage.getItem("hydroCaru_Full_System");
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
      localStorage.setItem("hydroCaru_Full_System", JSON.stringify({ isSetupComplete, plants, params, lastCleaning, history }));
    }
  }, [isSetupComplete, plants, params, lastCleaning, history]);

  // --- CÁLCULOS DE CORRECCIÓN ---
  const nEC = parseFloat(params.ec) || 0;
  const nVol = parseFloat(params.waterVol) || 0;
  const recommendedEC = plants.length > 0 ? 1.6 : 1.2;
  const ecDiff = recommendedEC - nEC;
  const mlHyPro = ecDiff > 0.05 ? (ecDiff / 0.1) * nVol * 0.25 : 0;
  const daysSinceCleaning = Math.floor((Date.now() - new Date(lastCleaning).getTime()) / (1000 * 60 * 60 * 24));

  // --- HANDLERS ---
  const saveMeasurement = () => {
    const newEntry = { ...params, date: new Date().toLocaleString(), id: Date.now() };
    setHistory([newEntry, ...history]);
    setActiveTab("overview");
  };

  if (!isSetupComplete) {
    return (
      <div className="min-h-screen bg-slate-100 flex items-center justify-center p-4">
        <Card className="w-full max-w-md p-8 space-y-6 shadow-2xl border-t-8 border-green-600 rounded-[2rem]">
          <h1 className="text-4xl font-black text-center italic tracking-tighter">HydroCaru</h1>
          <div className="space-y-4">
            <div>
              <label className="text-[10px] font-black uppercase text-slate-400">Capacidad Depósito (L)</label>
              <input type="text" inputMode="decimal" value={params.waterVol} onChange={(e) => setParams({...params, waterVol: e.target.value})} className="w-full p-4 bg-slate-50 border-2 rounded-2xl font-bold" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-[10px] font-black uppercase text-slate-400">Stock A (ml)</label>
                <input type="text" value={params.nutA} onChange={(e) => setParams({...params, nutA: e.target.value})} className="w-full p-4 bg-slate-50 border-2 rounded-2xl font-bold" />
              </div>
              <div>
                <label className="text-[10px] font-black uppercase text-slate-400">Stock B (ml)</label>
                <input type="text" value={params.nutB} onChange={(e) => setParams({...params, nutB: e.target.value})} className="w-full p-4 bg-slate-50 border-2 rounded-2xl font-bold" />
              </div>
            </div>
          </div>
          <button onClick={() => setIsSetupComplete(true)} className="w-full bg-green-600 text-white p-5 rounded-2xl font-black shadow-lg">INICIAR SISTEMA</button>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 pb-32">
      <header className="bg-white border-b p-4 sticky top-0 z-50 flex justify-between items-center">
        <div className="flex items-center gap-2 font-black text-green-600 text-2xl italic tracking-tighter"><Sprout /> HydroCaru</div>
        <Badge className="bg-green-600">{params.waterVol}L</Badge>
      </header>

      <main className="container mx-auto p-4 max-w-md">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          {/* MENÚ DE 7 PESTAÑAS (Scroll horizontal en móvil) */}
          <div className="overflow-x-auto no-scrollbar mb-6">
            <TabsList className="flex w-max min-w-full h-16 bg-white border shadow-lg rounded-2xl p-1 gap-1">
              <TabsTrigger value="overview" className="px-4"><Activity className="w-5 h-5" /></TabsTrigger>
              <TabsTrigger value="measure" className="px-4"><Beaker className="w-5 h-5" /></TabsTrigger>
              <TabsTrigger value="tower" className="px-4"><Layers className="w-5 h-5" /></TabsTrigger>
              <TabsTrigger value="pump" className="px-4"><Timer className="w-5 h-5" /></TabsTrigger>
              <TabsTrigger value="calendar" className="px-4"><Calendar className="w-5 h-5" /></TabsTrigger>
              <TabsTrigger value="history" className="px-4"><History className="w-5 h-5" /></TabsTrigger>
              <TabsTrigger value="settings" className="px-4"><Trash2 className="w-5 h-5 text-red-400" /></TabsTrigger>
            </TabsList>
          </div>

          {/* 1. RESUMEN + CORRECCIÓN */}
          <TabsContent value="overview" className="space-y-4">
            {mlHyPro > 0 && (
              <Card className="border-l-8 border-l-blue-600 bg-blue-50 shadow-md p-6 flex items-center gap-6 rounded-2xl">
                <FlaskConical className="text-blue-600 w-10 h-10" />
                <div>
                  <p className="text-[10px] font-black text-blue-600 uppercase">Corrección Hy-Pro</p>
                  <p className="text-4xl font-black text-blue-950">{mlHyPro.toFixed(1)} ml <span className="text-sm font-normal text-blue-500">A+B</span></p>
                </div>
              </Card>
            )}
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-white p-6 rounded-3xl shadow-sm text-center">
                <p className="text-[10px] font-bold text-slate-400 mb-1 uppercase tracking-widest">pH</p>
                <p className="text-4xl font-black">{params.pH}</p>
              </div>
              <div className="bg-white p-6 rounded-3xl shadow-sm text-center">
                <p className="text-[10px] font-bold text-slate-400 mb-1 uppercase tracking-widest">EC</p>
                <p className="text-4xl font-black">{params.ec}</p>
              </div>
            </div>
          </TabsContent>

          {/* 2. MEDICIÓN */}
          <TabsContent value="measure">
            <Card className="p-8 rounded-[2rem] space-y-6 shadow-xl border-none">
              <h2 className="font-black text-center text-xl italic tracking-tight">Registro Diario</h2>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase ml-2">pH</label>
                  <input type="text" inputMode="decimal" value={params.pH} onChange={e => setParams({...params, pH: e.target.value})} className="w-full p-4 bg-slate-50 rounded-2xl font-black text-center text-xl" />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase ml-2">EC</label>
                  <input type="text" inputMode="decimal" value={params.ec} onChange={e => setParams({...params, ec: e.target.value})} className="w-full p-4 bg-slate-50 rounded-2xl font-black text-center text-xl" />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase ml-2">Vol (L)</label>
                  <input type="text" inputMode="decimal" value={params.waterVol} onChange={e => setParams({...params, waterVol: e.target.value})} className="w-full p-4 bg-slate-50 rounded-2xl font-black text-center text-xl" />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase ml-2">Temp</label>
                  <input type="text" inputMode="decimal" value={params.waterTemp} onChange={e => setParams({...params, waterTemp: e.target.value})} className="w-full p-4 bg-slate-50 rounded-2xl font-black text-center text-xl" />
                </div>
              </div>
              <button onClick={saveMeasurement} className="w-full bg-slate-900 text-white p-5 rounded-2xl font-black">GUARDAR DATOS</button>
            </Card>
          </TabsContent>

          {/* 3. TORRE */}
          <TabsContent value="tower" className="space-y-6">
            {[3, 2, 1].map(lvl => (
              <div key={lvl} className="bg-white p-6 rounded-[2.5rem] shadow-sm border border-slate-100">
                <p className="text-center text-[10px] font-black text-slate-300 uppercase tracking-[0.3em] mb-4">Nivel {lvl}</p>
                <div className="grid grid-cols-3 gap-6">
                  {[1, 2, 3, 4, 5, 6].map(pos => {
                    const p = plants.find(x => x.level === lvl && x.position === pos);
                    return (
                      <button key={pos} onClick={() => p ? setPlants(plants.filter(id => id.id !== p.id)) : setShowPlantSelector({lvl, pos})}
                        className={`w-full aspect-square rounded-3xl flex items-center justify-center border-2 transition-all ${p ? 'bg-green-500 border-green-400 text-white shadow-lg' : 'bg-slate-50 border-dashed border-slate-200 text-slate-300'}`}>
                        {p ? <span className="text-[9px] font-black uppercase text-center">{p.variety.slice(0,4)}</span> : <Plus />}
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}
          </TabsContent>

          {/* 4. BOMBA (PUMP) */}
          <TabsContent value="pump">
            <Card className="p-8 rounded-[2rem] text-center space-y-6 shadow-sm border-none">
              <Droplets className="w-12 h-12 text-blue-500 mx-auto" />
              <h3 className="font-black text-xl uppercase italic">Control de Riego</h3>
              <div className="p-6 bg-slate-50 rounded-3xl border-2 border-slate-100">
                <p className="text-xs font-bold text-slate-400 uppercase mb-2">Ciclo Recomendado</p>
                <p className="text-2xl font-black text-slate-800 tracking-tight">15 min ON / 45 min OFF</p>
              </div>
              <div className="flex items-center gap-4 bg-green-50 p-4 rounded-2xl border border-green-100">
                <CheckCircle2 className="text-green-600" />
                <p className="text-xs text-green-700 font-bold uppercase">Bomba de Oxígeno: 24h Activa</p>
              </div>
            </Card>
          </TabsContent>

          {/* 5. CALENDARIO */}
          <TabsContent value="calendar" className="space-y-4">
            <Card className="p-6 rounded-3xl border-none shadow-sm space-y-4 text-center">
              <Badge className="bg-amber-100 text-amber-700 mx-auto">Día {daysSinceCleaning} del ciclo</Badge>
              <h3 className="font-black text-lg">Mantenimiento</h3>
              <div className="p-4 bg-slate-50 rounded-2xl flex justify-between items-center">
                <p className="text-xs font-bold uppercase text-slate-500">Limpieza Depósito</p>
                <button onClick={() => setLastCleaning(new Date().toISOString())} className="text-xs bg-green-600 text-white px-4 py-2 rounded-lg font-bold">RESET</button>
              </div>
              <p className="text-[10px] text-slate-400 font-medium">Próxima limpieza recomendada en {Math.max(0, 14 - daysSinceCleaning)} días.</p>
            </Card>
          </TabsContent>

          {/* 6. HISTORIAL */}
          <TabsContent value="history" className="space-y-3">
            <h3 className="font-black text-center text-slate-400 uppercase text-xs mb-4">Registros Anteriores</h3>
            {history.map((h: any) => (
              <div key={h.id} className="bg-white p-4 rounded-2xl shadow-sm border flex justify-between items-center">
                <div>
                  <p className="text-[10px] font-bold text-slate-400">{h.date}</p>
                  <p className="font-black text-slate-700">pH: {h.pH} | EC: {h.ec}</p>
                </div>
                <Badge variant="outline" className="text-[10px]">{h.waterVol}L</Badge>
              </div>
            ))}
          </TabsContent>

          {/* 7. AJUSTES / RESET */}
          <TabsContent value="settings" className="py-10">
            <button onClick={() => {localStorage.clear(); window.location.reload();}} className="w-full bg-red-50 text-red-600 p-8 rounded-3xl font-black border-2 border-red-100 hover:bg-red-600 hover:text-white transition-all shadow-sm">
              <Trash2 className="mx-auto mb-2" />
              BORRAR TODOS LOS DATOS Y REINICIAR APP
            </button>
          </TabsContent>
        </Tabs>
      </main>

      {/* SELECTOR DE PLANTAS */}
      {showPlantSelector && (
        <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-md z-[100] flex items-end justify-center">
          <div className="bg-white w-full max-w-md rounded-t-[3rem] p-10 space-y-4 animate-in slide-in-from-bottom">
            <h3 className="text-2xl font-black text-center">Variedad de Lechuga</h3>
            <div className="grid grid-cols-1 gap-2">
              {VARIETIES.map(v => (
                <button key={v} onClick={() => { setPlants([...plants, {id: Date.now(), variety: v, level: showPlantSelector.lvl, position: showPlantSelector.pos}]); setShowPlantSelector(null); }} 
                  className="w-full p-5 bg-slate-50 rounded-2xl font-black text-left hover:bg-green-500 hover:text-white transition-all">
                  {v}
                </button>
              ))}
              <button onClick={() => setShowPlantSelector(null)} className="w-full p-4 text-slate-400 font-bold uppercase text-[10px] mt-4">Cancelar</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
