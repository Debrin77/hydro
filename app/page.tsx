"use client"

import React, { useState, useEffect } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Sprout, Activity, Layers, Beaker, Plus, FlaskConical, AlertTriangle, Trash2 } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

// --- COMPONENTE INTERNO DE LA TORRE (Para evitar errores de importación) ---
const InternalTower = ({ plants, onAdd, onRemove }: any) => {
  const levels = [3, 2, 1];
  return (
    <div className="flex flex-col items-center gap-6 py-4 bg-slate-50 rounded-3xl border shadow-inner">
      {levels.map((lvl) => (
        <div key={lvl} className="flex flex-col items-center gap-2">
          <span className="text-[10px] font-black text-slate-400 uppercase">Nivel {lvl}</span>
          <div className="grid grid-cols-3 gap-3">
            {[1, 2, 3, 4, 5, 6].map((pos) => {
              const plant = plants.find((p: any) => p.level === lvl && p.position === pos);
              return (
                <button
                  key={pos}
                  onClick={() => plant ? onRemove(plant.id) : onAdd("Romana", lvl, pos)}
                  className={`w-12 h-12 rounded-full border-2 flex items-center justify-center transition-all ${
                    plant ? 'bg-green-500 border-white shadow-md' : 'bg-white border-dashed border-slate-300 text-slate-300'
                  }`}
                >
                  {plant ? <span className="text-[8px] text-white font-bold">OCUPADO</span> : <Plus className="w-4 h-4" />}
                </button>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
};

export default function HydroponicTowerApp() {
  const [isSetupComplete, setIsSetupComplete] = useState(false);
  const [activeTab, setActiveTab] = useState("overview");
  const [plants, setPlants] = useState<any[]>([]);
  const [parameters, setParameters] = useState({ pH: 6.0, ec: 1.2, waterVolume: 20 });

  // 1. CARGAR DATOS
  useEffect(() => {
    const saved = localStorage.getItem("hydroCaruData");
    if (saved) {
      try {
        const d = JSON.parse(saved);
        if (d.isSetupComplete) {
          setIsSetupComplete(true);
          setPlants(d.plants || []);
          setParameters(d.parameters || { pH: 6.0, ec: 1.2, waterVolume: 20 });
        }
      } catch (e) { console.error(e); }
    }
  }, []);

  // 2. GUARDAR DATOS
  useEffect(() => {
    if (isSetupComplete) {
      localStorage.setItem("hydroCaruData", JSON.stringify({ isSetupComplete, plants, parameters }));
    }
  }, [isSetupComplete, plants, parameters]);

  // --- LÓGICA DE CORRECCIÓN (LA RECETA) ---
  const recommendedEC = 1.5;
  const ecDiff = recommendedEC - parameters.ec;
  const needsCorrection = ecDiff > 0.1 || parameters.pH < 5.5 || parameters.pH > 6.5;
  const mlHyPro = (ecDiff / 0.1) * parameters.waterVolume * 0.25;

  if (!isSetupComplete) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6 bg-green-50">
        <Card className="w-full max-w-sm p-6 text-center space-y-4">
          <div className="bg-green-500 w-16 h-16 rounded-full flex items-center justify-center mx-auto shadow-lg">
            <Sprout className="text-white w-10 h-10" />
          </div>
          <h1 className="text-2xl font-black">¡Bienvenido a HydroCaru!</h1>
          <p className="text-slate-500 text-sm">Configura tu depósito para empezar.</p>
          <input 
            type="number" 
            placeholder="Litros del depósito (ej: 20)" 
            className="w-full p-3 border rounded-xl text-center font-bold"
            onChange={(e) => setParameters({...parameters, waterVolume: Number(e.target.value)})}
          />
          <button 
            onClick={() => setIsSetupComplete(true)}
            className="w-full bg-green-600 text-white p-4 rounded-xl font-bold shadow-md active:scale-95 transition-transform"
          >
            INICIALIZAR SISTEMA
          </button>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 pb-24 font-sans">
      <header className="bg-white border-b p-4 sticky top-0 z-50 flex justify-between items-center">
        <div className="flex items-center gap-2 font-black text-green-600 text-xl"><Sprout /> HydroCaru</div>
        <Badge variant="outline">{parameters.waterVolume}L | Obj: {recommendedEC}</Badge>
      </header>

      <main className="container mx-auto p-4 max-w-md space-y-6">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid grid-cols-4 w-full h-14 bg-white border shadow-sm rounded-2xl overflow-hidden">
            <TabsTrigger value="overview"><Activity /></TabsTrigger>
            <TabsTrigger value="tower"><Layers /></TabsTrigger>
            <TabsTrigger value="measurements"><Beaker /></TabsTrigger>
            <TabsTrigger value="settings"><Trash2 className="w-4 h-4 text-red-400" /></TabsTrigger>
          </TabsList>

          {/* VISTA DE RESUMEN Y RECETA */}
          <TabsContent value="overview" className="space-y-4 outline-none">
            {needsCorrection && (
              <Card className="border-2 border-blue-500 bg-blue-50 overflow-hidden shadow-xl animate-pulse">
                <CardHeader className="bg-blue-500 p-2 text-white text-center text-[10px] font-bold uppercase">Ajuste Requerido</CardHeader>
                <CardContent className="p-4 space-y-3">
                  <div className="flex items-center gap-4">
                    <FlaskConical className="w-8 h-8 text-blue-600" />
                    <div>
                      <p className="text-xs font-bold text-blue-600 uppercase">Añadir Hy-Pro A + B</p>
                      <p className="text-2xl font-black">{mlHyPro.toFixed(1)} ml <span className="text-sm font-normal">de cada uno</span></p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
            
            <div className="grid grid-cols-2 gap-4">
              <Card className="p-4 text-center">
                <p className="text-[10px] font-bold text-slate-400 uppercase">pH Actual</p>
                <p className={`text-3xl font-black ${parameters.pH < 5.5 || parameters.pH > 6.5 ? 'text-red-500' : 'text-slate-900'}`}>{parameters.pH}</p>
              </Card>
              <Card className="p-4 text-center">
                <p className="text-[10px] font-bold text-slate-400 uppercase">EC Actual</p>
                <p className="text-3xl font-black">{parameters.ec}</p>
              </Card>
            </div>
          </TabsContent>

          {/* VISTA DE LA TORRE */}
          <TabsContent value="tower" className="outline-none">
            <h2 className="text-center font-bold text-slate-500 mb-4 uppercase text-xs">Toca un hueco para plantar</h2>
            <InternalTower 
              plants={plants} 
              onAdd={(v:any, l:any, p:any) => setPlants([...plants, {id: Date.now(), variety: v, level: l, position: p}])}
              onRemove={(id:any) => setPlants(plants.filter(p => p.id !== id))}
            />
          </TabsContent>

          {/* VISTA DE MEDICIÓN */}
          <TabsContent value="measurements" className="space-y-4">
            <Card className="p-6 space-y-4">
              <h3 className="font-bold text-center uppercase text-xs">Registrar Medida</h3>
              <div className="space-y-4">
                <input type="number" step="0.1" placeholder="Nuevo pH" className="w-full p-4 border rounded-xl" 
                  onChange={(e) => setParameters({...parameters, pH: Number(e.target.value)})} />
                <input type="number" step="0.1" placeholder="Nueva EC" className="w-full p-4 border rounded-xl" 
                  onChange={(e) => setParameters({...parameters, ec: Number(e.target.value)})} />
                <button onClick={() => setActiveTab("overview")} className="w-full bg-slate-900 text-white p-4 rounded-xl font-bold">GUARDAR Y VER RECETA</button>
              </div>
            </Card>
          </TabsContent>

          {/* RESET (Por si algo falla) */}
          <TabsContent value="settings">
             <button 
              onClick={() => {localStorage.clear(); window.location.reload();}}
              className="w-full bg-red-100 text-red-600 p-6 rounded-3xl font-bold border-2 border-red-200"
             >
               BORRAR TODO Y EMPEZAR DE CERO
             </button>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}
