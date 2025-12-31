"use client"

import React, { useState, useEffect } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Sprout, Activity, Layers, Beaker, Calendar, Droplets, Thermometer, Trash2, Plus, FlaskConical, AlertTriangle } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"

// --- CONFIGURACIÓN FIJA ---
const VARIETIES = ["Romana", "Iceberg", "Hoja de Roble", "Lollo Rosso", "Trocadero"];

export default function HydroponicTowerApp() {
  // Estados principales
  const [isSetupComplete, setIsSetupComplete] = useState(false);
  const [activeTab, setActiveTab] = useState("overview");
  const [plants, setPlants] = useState<any[]>([]);
  const [parameters, setParameters] = useState({ pH: 6.0, ec: 1.2, waterVolume: 20, waterTemp: 20 });
  const [lastCleaning, setLastCleaning] = useState(new Date().toISOString());
  const [showPlantSelector, setShowPlantSelector] = useState<{lvl: number, pos: number} | null>(null);

  // --- PERSISTENCIA BLINDADA ---
  useEffect(() => {
    const saved = localStorage.getItem("hydroCaru_Final_V3");
    if (saved) {
      try {
        const d = JSON.parse(saved);
        setIsSetupComplete(!!d.isSetupComplete);
        setPlants(d.plants || []);
        setParameters(d.parameters || { pH: 6.0, ec: 1.2, waterVolume: 20, waterTemp: 20 });
        setLastCleaning(d.lastCleaning || new Date().toISOString());
      } catch (e) { console.error("Error cargando datos:", e); }
    }
  }, []);

  useEffect(() => {
    if (isSetupComplete) {
      localStorage.setItem("hydroCaru_Final_V3", JSON.stringify({ isSetupComplete, plants, parameters, lastCleaning }));
    }
  }, [isSetupComplete, plants, parameters, lastCleaning]);

  // --- LÓGICA DE CÁLCULO ---
  const recommendedEC = plants.length > 0 ? 1.6 : 1.2;
  const ecDiff = recommendedEC - parameters.ec;
  const mlHyPro = ecDiff > 0 ? (ecDiff / 0.1) * parameters.waterVolume * 0.25 : 0;
  const daysSinceCleaning = Math.floor((Date.now() - new Date(lastCleaning).getTime()) / (1000 * 60 * 60 * 24));

  // --- FUNCIONES DE ACCIÓN (SIN DEPENDENCIAS EXTERNAS) ---
  const addPlant = (variety: string) => {
    if (!showPlantSelector) return;
    const newPlant = {
      id: Date.now().toString(),
      variety,
      level: showPlantSelector.lvl,
      position: showPlantSelector.pos,
      date: new Date().toISOString()
    };
    setPlants([...plants, newPlant]);
    setShowPlantSelector(null);
  };

  const removePlant = (id: string) => {
    setPlants(plants.filter(p => p.id !== id));
  };

  const updateParam = (key: string, val: string) => {
    setParameters({ ...parameters, [key]: parseFloat(val) || 0 });
  };

  // --- PANTALLA DE INICIO ---
  if (!isSetupComplete) {
    return (
      <div className="min-h-screen bg-slate-100 flex items-center justify-center p-6">
        <Card className="w-full max-w-sm p-8 space-y-6 shadow-2xl">
          <div className="flex justify-center"><Droplets className="w-16 h-16 text-blue-500" /></div>
          <h1 className="text-3xl font-black text-center">HydroCaru</h1>
          <div className="space-y-2">
            <label className="text-xs font-bold uppercase text-slate-400">Litros del depósito</label>
            <input type="number" className="w-full p-4 bg-slate-50 border-2 rounded-2xl text-xl font-bold" 
              placeholder="Ej: 20" onChange={(e) => updateParam('waterVolume', e.target.value)} />
          </div>
          <button onClick={() => setIsSetupComplete(true)} className="w-full bg-blue-600 text-white p-5 rounded-2xl font-black shadow-lg">EMPEZAR CULTIVO</button>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 pb-28 font-sans">
      {/* HEADER */}
      <header className="bg-white border-b p-4 sticky top-0 z-50 flex justify-between items-center shadow-sm">
        <div className="flex items-center gap-2 font-black text-green-600 text-xl"><Sprout /> HydroCaru</div>
        <Badge className="bg-blue-100 text-blue-700 border-none">{parameters.waterVolume} Litros</Badge>
      </header>

      <main className="container mx-auto p-4 max-w-md">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid grid-cols-4 w-full h-16 bg-white border shadow-md rounded-2xl p-1 mb-6">
            <TabsTrigger value="overview"><Activity /></TabsTrigger>
            <TabsTrigger value="tower"><Layers /></TabsTrigger>
            <TabsTrigger value="measure"><Beaker /></TabsTrigger>
            <TabsTrigger value="calendar"><Calendar /></TabsTrigger>
          </TabsList>

          {/* 1. RESUMEN Y RECETA */}
          <TabsContent value="overview" className="space-y-4">
            {mlHyPro > 0 && (
              <Card className="border-2 border-blue-500 bg-blue-50 overflow-hidden">
                <div className="bg-blue-500 text-white text-[10px] font-black p-1 text-center uppercase">Dosis Hy-Pro A + B</div>
                <CardContent className="p-4 flex items-center gap-4">
                  <FlaskConical className="w-10 h-10 text-blue-600" />
                  <div>
                    <p className="text-3xl font-black text-blue-900">{mlHyPro.toFixed(1)} ml</p>
                    <p className="text-xs text-blue-700 font-medium">de cada parte por depósito</p>
                  </div>
                </CardContent>
              </Card>
            )}

            <div className="grid grid-cols-2 gap-3">
              <Card className="p-4 text-center bg-white border-none shadow-sm">
                <p className="text-[10px] font-bold text-slate-400 uppercase">pH</p>
                <p className={`text-4xl font-black ${parameters.pH < 5.5 || parameters.pH > 6.5 ? 'text-red-500' : ''}`}>{parameters.pH}</p>
              </Card>
              <Card className="p-4 text-center bg-white border-none shadow-sm">
                <p className="text-[10px] font-bold text-slate-400 uppercase">EC</p>
                <p className="text-4xl font-black">{parameters.ec}</p>
              </Card>
            </div>

            {daysSinceCleaning >= 14 && (
              <div className="p-4 bg-amber-100 border-2 border-amber-200 rounded-2xl flex items-center gap-3">
                <AlertTriangle className="text-amber-600" />
                <p className="text-xs font-bold text-amber-800 uppercase">Toca limpiar el sistema</p>
              </div>
            )}
          </TabsContent>

          {/* 2. TORRE DE CULTIVO */}
          <TabsContent value="tower" className="space-y-4">
            {[3, 2, 1].map(lvl => (
              <div key={lvl} className="bg-white p-4 rounded-3xl shadow-sm border space-y-3">
                <p className="text-center text-[10px] font-black text-slate-300 uppercase tracking-widest">Nivel {lvl}</p>
                <div className="grid grid-cols-3 gap-4 justify-items-center">
                  {[1, 2, 3, 4, 5, 6].map(pos => {
                    const p = plants.find(x => x.level === lvl && x.position === pos);
                    return (
                      <button key={pos} onClick={() => p ? removePlant(p.id) : setShowPlantSelector({lvl, pos})}
                        className={`w-14 h-14 rounded-2xl flex items-center justify-center border-2 transition-all ${p ? 'bg-green-500 border-green-600 text-white' : 'bg-slate-50 border-dashed border-slate-200 text-slate-300'}`}>
                        {p ? <span className="text-[8px] font-black uppercase text-center">{p.variety.slice(0,4)}</span> : <Plus />}
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}
          </TabsContent>

          {/* 3. MEDICIONES */}
          <TabsContent value="measure" className="space-y-4">
            <Card className="p-6 space-y-4 border-none shadow-lg">
              <h2 className="font-black text-center text-lg uppercase">Registrar Datos</h2>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase ml-1">pH Agua</label>
                  <input type="number" step="0.1" value={parameters.pH} onChange={e => updateParam('pH', e.target.value)} className="w-full p-4 bg-slate-100 rounded-xl font-bold" />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase ml-1">EC (mS/cm)</label>
                  <input type="number" step="0.1" value={parameters.ec} onChange={e => updateParam('ec', e.target.value)} className="w-full p-4 bg-slate-100 rounded-xl font-bold" />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase ml-1">Volumen (L)</label>
                  <input type="number" value={parameters.waterVolume} onChange={e => updateParam('waterVolume', e.target.value)} className="w-full p-4 bg-slate-100 rounded-xl font-bold" />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase ml-1">Temp (°C)</label>
                  <input type="number" value={parameters.waterTemp} onChange={e => updateParam('waterTemp', e.target.value)} className="w-full p-4 bg-slate-100 rounded-xl font-bold" />
                </div>
              </div>
              <button onClick={() => setActiveTab("overview")} className="w-full bg-slate-900 text-white p-5 rounded-2xl font-black">GUARDAR MEDIDAS</button>
            </Card>
          </TabsContent>

          {/* 4. MANTENIMIENTO Y RESET */}
          <TabsContent value="calendar" className="space-y-4 text-center">
            <Card className="p-6 space-y-4">
              <p className="text-sm font-bold">Días desde última limpieza: {daysSinceCleaning}</p>
              <button onClick={() => setLastCleaning(new Date().toISOString())} className="w-full bg-green-100 text-green-700 p-4 rounded-xl font-bold">MARCAR LIMPIEZA HOY</button>
            </Card>
            <div className="pt-10">
              <button onClick={() => {localStorage.clear(); window.location.reload();}} className="text-red-400 text-[10px] font-bold uppercase flex items-center justify-center gap-2 mx-auto">
                <Trash2 className="w-3 h-3" /> Borrar todos los datos
              </button>
            </div>
          </TabsContent>
        </Tabs>
      </main>

      {/* SELECTOR DE VARIEDAD (MODAL) */}
      {showPlantSelector && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-[100] flex items-end justify-center">
          <div className="bg-white w-full max-w-md rounded-t-[3rem] p-8 space-y-4 animate-in slide-in-from-bottom">
            <h3 className="text-xl font-black text-center">¿Qué vas a plantar?</h3>
            <div className="grid grid-cols-1 gap-2">
              {VARIETIES.map(v => (
                <button key={v} onClick={() => addPlant(v)} className="w-full p-5 bg-slate-50 rounded-2xl font-bold text-left hover:bg-green-500 hover:text-white transition-all">{v}</button>
              ))}
              <button onClick={() => setShowPlantSelector(null)} className="w-full p-4 text-slate-400 font-bold uppercase text-[10px] mt-4">Cerrar</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
