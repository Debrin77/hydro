"use client"

import React, { useState, useEffect } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Sprout, Activity, Layers, Beaker, Calendar, Droplets, Thermometer, Trash2, Plus, Check } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

// --- VARIANTES DE LECHUGA ---
const VARIETIES = ["Romana", "Iceberg", "Hoja de Roble", "Lollo Rosso", "Trocadero"];

export default function HydroponicTowerApp() {
  const [isSetupComplete, setIsSetupComplete] = useState(false);
  const [activeTab, setActiveTab] = useState("overview");
  const [plants, setPlants] = useState<any[]>([]);
  const [parameters, setParameters] = useState({ 
    pH: 6.0, 
    ec: 1.2, 
    waterVolume: 20, 
    waterTemp: 20 
  });
  const [lastCleaning, setLastCleaning] = useState(new Date().toISOString());
  const [showPlantSelector, setShowPlantSelector] = useState<{lvl: number, pos: number} | null>(null);

  // --- PERSISTENCIA ---
  useEffect(() => {
    const saved = localStorage.getItem("hydroCaruData_v2");
    if (saved) {
      try {
        const d = JSON.parse(saved);
        if (d.isSetupComplete) {
          setIsSetupComplete(true);
          setPlants(d.plants || []);
          setParameters(d.parameters || parameters);
          setLastCleaning(d.lastCleaning || new Date().toISOString());
        }
      } catch (e) { console.error(e); }
    }
  }, []);

  useEffect(() => {
    if (isSetupComplete) {
      localStorage.setItem("hydroCaruData_v2", JSON.stringify({ isSetupComplete, plants, parameters, lastCleaning }));
    }
  }, [isSetupComplete, plants, parameters, lastCleaning]);

  // --- LÓGICA DE CORRECCIÓN ---
  const recommendedEC = plants.length > 0 ? 1.6 : 1.2;
  const ecDiff = recommendedEC - parameters.ec;
  const mlHyPro = Math.max(0, (ecDiff / 0.1) * parameters.waterVolume * 0.25);
  
  const daysSinceCleaning = Math.floor((Date.now() - new Date(lastCleaning).getTime()) / (1000 * 60 * 60 * 24));
  const needsCleaning = daysSinceCleaning >= 14;

  if (!isSetupComplete) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6 bg-slate-50">
        <Card className="w-full max-w-sm p-8 text-center space-y-6 shadow-2xl border-t-4 border-t-green-500">
          <div className="bg-green-100 w-20 h-20 rounded-full flex items-center justify-center mx-auto">
            <Droplets className="text-green-600 w-10 h-10" />
          </div>
          <h1 className="text-3xl font-black text-slate-800">HydroCaru</h1>
          <p className="text-slate-500">Configura tu depósito para empezar el cultivo.</p>
          <div className="text-left space-y-2">
            <label className="text-xs font-bold uppercase text-slate-400 ml-1">Litros Totales</label>
            <input type="number" placeholder="Ej: 20" className="w-full p-4 bg-slate-100 rounded-2xl font-bold text-xl outline-none focus:ring-2 ring-green-500"
              onChange={(e) => setParameters({...parameters, waterVolume: Number(e.target.value)})} />
          </div>
          <button onClick={() => setIsSetupComplete(true)} className="w-full bg-green-600 text-white p-5 rounded-2xl font-black shadow-lg hover:bg-green-700 transition-all">INICIALIZAR</button>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 pb-24 font-sans text-slate-900">
      <header className="bg-white border-b p-4 sticky top-0 z-50 flex justify-between items-center">
        <div className="flex items-center gap-2 font-black text-green-600 text-xl tracking-tighter"><Sprout /> HydroCaru</div>
        <div className="flex gap-2">
          <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">{parameters.waterVolume}L</Badge>
          <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">EC Obj: {recommendedEC}</Badge>
        </div>
      </header>

      <main className="container mx-auto p-4 max-w-md space-y-6">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid grid-cols-5 w-full h-16 bg-white border shadow-md rounded-2xl p-1">
            <TabsTrigger value="overview" className="rounded-xl"><Activity className="w-5 h-5" /></TabsTrigger>
            <TabsTrigger value="tower" className="rounded-xl"><Layers className="w-5 h-5" /></TabsTrigger>
            <TabsTrigger value="measurements" className="rounded-xl"><Beaker className="w-5 h-5" /></TabsTrigger>
            <TabsTrigger value="calendar" className="rounded-xl"><Calendar className="w-5 h-5" /></TabsTrigger>
            <TabsTrigger value="settings" className="rounded-xl"><Trash2 className="w-5 h-5 opacity-30" /></TabsTrigger>
          </TabsList>

          {/* 1. RESUMEN Y DOSIS */}
          <TabsContent value="overview" className="space-y-4 outline-none">
            {mlHyPro > 0 && (
              <Card className="border-2 border-blue-500 bg-blue-50 shadow-xl overflow-hidden">
                <div className="bg-blue-500 p-2 text-white text-center text-[10px] font-black uppercase">Receta Hy-Pro A + B</div>
                <CardContent className="p-4 flex items-center gap-4">
                  <div className="bg-white p-3 rounded-2xl shadow-sm"><FlaskConical className="text-blue-600 w-8 h-8" /></div>
                  <div>
                    <p className="text-3xl font-black text-blue-900">{mlHyPro.toFixed(1)} ml</p>
                    <p className="text-xs font-medium text-blue-700">Añadir de cada parte (A y B)</p>
                  </div>
                </CardContent>
              </Card>
            )}

            {needsCleaning && (
              <Card className="border-2 border-amber-500 bg-amber-50 p-4 flex items-center gap-4">
                <AlertTriangle className="text-amber-600 w-8 h-8" />
                <div className="flex-1">
                  <p className="font-black text-amber-900">Limpieza Pendiente</p>
                  <p className="text-xs text-amber-700">Han pasado {daysSinceCleaning} días desde la última limpieza.</p>
                </div>
                <button onClick={() => setLastCleaning(new Date().toISOString())} className="bg-amber-500 text-white p-2 rounded-lg text-xs font-bold">Hecho</button>
              </Card>
            )}

            <div className="grid grid-cols-2 gap-4">
              <Card className="p-4 bg-white shadow-sm border-none">
                <p className="text-[10px] font-black text-slate-400 uppercase mb-1">pH</p>
                <p className={`text-4xl font-black ${parameters.pH < 5.5 || parameters.pH > 6.5 ? 'text-red-500' : 'text-slate-800'}`}>{parameters.pH}</p>
              </Card>
              <Card className="p-4 bg-white shadow-sm border-none">
                <p className="text-[10px] font-black text-slate-400 uppercase mb-1">EC</p>
                <p className="text-4xl font-black text-slate-800">{parameters.ec}</p>
              </Card>
              <Card className="p-4 bg-white shadow-sm border-none">
                <p className="text-[10px] font-black text-slate-400 uppercase mb-1">Temp</p>
                <div className="flex items-center gap-2">
                  <Thermometer className="w-4 h-4 text-orange-400" />
                  <p className="text-2xl font-black">{parameters.waterTemp}°C</p>
                </div>
              </Card>
              <Card className="p-4 bg-white shadow-sm border-none">
                <p className="text-[10px] font-black text-slate-400 uppercase mb-1">Plantas</p>
                <p className="text-2xl font-black">{plants.length} / 18</p>
              </Card>
            </div>
          </TabsContent>

          {/* 2. TORRE Y DISTRIBUCIÓN */}
          <TabsContent value="tower" className="outline-none">
            <div className="space-y-6">
              {[3, 2, 1].map((lvl) => (
                <div key={lvl} className="bg-white rounded-3xl p-4 shadow-sm space-y-3">
                  <h3 className="text-center text-[10px] font-black text-slate-400 uppercase tracking-widest">Nivel {lvl}</h3>
                  <div className="grid grid-cols-3 gap-4 justify-items-center">
                    {[1, 2, 3, 4, 5, 6].map((pos) => {
                      const plant = plants.find(p => p.level === lvl && p.position === pos);
                      return (
                        <button key={pos} onClick={() => plant ? setPlants(plants.filter(p => p.id !== plant.id)) : setShowPlantSelector({lvl, pos})}
                          className={`w-14 h-14 rounded-2xl flex flex-col items-center justify-center transition-all border-2 ${
                            plant ? 'bg-green-500 border-green-600 text-white shadow-lg' : 'bg-slate-50 border-dashed border-slate-200 text-slate-300'
                          }`}>
                          {plant ? <span className="text-[7px] font-black leading-tight uppercase">{plant.variety}</span> : <Plus className="w-4 h-4" />}
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          </TabsContent>

          {/* 3. MEDICIONES PRO */}
          <TabsContent value="measurements">
            <Card className="p-6 bg-white shadow-xl rounded-3xl space-y-6 border-none">
              <h3 className="font-black text-center text-lg">Nueva Medición</h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase ml-1">pH</label>
                  <input type="number" step="0.1" value={parameters.pH} className="w-full p-4 bg-slate-50 rounded-2xl font-bold"
                    onChange={(e) => setParameters({...parameters, pH: Number(e.target.value)})} />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase ml-1">EC</label>
                  <input type="number" step="0.1" value={parameters.ec} className="w-full p-4 bg-slate-50 rounded-2xl font-bold"
                    onChange={(e) => setParameters({...parameters, ec: Number(e.target.value)})} />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase ml-1">Volumen (L)</label>
                  <input type="number" value={parameters.waterVolume} className="w-full p-4 bg-slate-50 rounded-2xl font-bold"
                    onChange={(e) => setParameters({...parameters, waterVolume: Number(e.target.value)})} />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase ml-1">Temp (°C)</label>
                  <input type="number" value={parameters.waterTemp} className="w-full p-4 bg-slate-50 rounded-2xl font-bold"
                    onChange={(e) => setParameters({...parameters, waterTemp: Number(e.target.value)})} />
                </div>
              </div>
              <button onClick={() => setActiveTab("overview")} className="w-full bg-slate-900 text-white p-5 rounded-2xl font-black shadow-lg">GUARDAR Y ACTUALIZAR</button>
            </Card>
          </TabsContent>

          {/* 4. CALENDARIO */}
          <TabsContent value="calendar">
             <Card className="p-6 space-y-6 bg-white rounded-3xl border-none shadow-sm">
                <div className="flex justify-between items-center">
                  <h3 className="font-black">Mantenimiento</h3>
                  <Badge className="bg-green-100 text-green-700">Día {daysSinceCleaning}</Badge>
                </div>
                <div className="space-y-4">
                  <div className="p-4 bg-slate-50 rounded-2xl border flex justify-between items-center">
                    <div>
                      <p className="text-sm font-bold">Próxima Limpieza</p>
                      <p className="text-[10px] text-slate-400">Recomendado cada 14 días</p>
                    </div>
                    <p className="font-black text-green-600">en {Math.max(0, 14 - daysSinceCleaning)} días</p>
                  </div>
                  <div className="p-4 bg-slate-50 rounded-2xl border flex justify-between items-center">
                    <div>
                      <p className="text-sm font-bold">Revisión pH/EC</p>
                      <p className="text-[10px] text-slate-400">Frecuencia diaria</p>
                    </div>
                    <Check className="text-green-500" />
                  </div>
                </div>
             </Card>
          </TabsContent>

          {/* 5. RESET */}
          <TabsContent value="settings">
            <div className="p-10 text-center space-y-4">
              <p className="text-xs text-slate-400 uppercase font-bold">Zona de Peligro</p>
              <button onClick={() => { localStorage.removeItem("hydroCaruData_v2"); window.location.reload(); }}
                className="w-full bg-red-50 text-red-600 p-6 rounded-3xl font-black border-2 border-red-100 hover:bg-red-600 hover:text-white transition-all">
                BORRAR TODO EL SISTEMA
              </button>
            </div>
          </TabsContent>
        </Tabs>
      </main>

      {/* SELECTOR DE PLANTAS (MODAL) */}
      {showPlantSelector && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[100] flex items-end sm:items-center justify-center p-4">
          <Card className="w-full max-w-sm p-6 rounded-3xl shadow-2xl animate-in slide-in-from-bottom">
            <h3 className="text-lg font-black mb-4 text-center">Seleccionar Variedad</h3>
            <div className="grid grid-cols-1 gap-2">
              {VARIETIES.map(v => (
                <button key={v} onClick={() => {
                  setPlants([...plants, { id: Date.now(), variety: v, level: showPlantSelector.lvl, position: showPlantSelector.pos }]);
                  setShowPlantSelector(null);
                }} className="p-4 bg-slate-50 rounded-2xl font-bold text-left hover:bg-green-500 hover:text-white transition-all">
                  {v}
                </button>
              ))}
              <button onClick={() => setShowPlantSelector(null)} className="mt-4 p-4 text-slate-400 font-bold uppercase text-xs">Cancelar</button>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}
