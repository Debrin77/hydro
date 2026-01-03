"use client"

import React, { useState, useEffect } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Sprout, Activity, Layers, Beaker, Calendar, Plus, Trash2, FlaskConical, ArrowDownCircle, Check, Lock, Lightbulb, Scissors } from "lucide-react"

const VARIETIES: { [key: string]: string } = {
  "Romana": "bg-emerald-500", "Iceberg": "bg-blue-400", "Hoja de Roble": "bg-red-500", "Lollo Rosso": "bg-purple-500", "Trocadero": "bg-lime-500"
};

export default function HydroAppV21() {
  const [isAuth, setIsAuth] = useState(false);
  const [isSetup, setIsSetup] = useState(false);
  const [tab, setTab] = useState("overview");
  const [plants, setPlants] = useState<any[]>([]);
  const [config, setConfig] = useState({ vol: "20", targetEC: "1.4", ph: "6.0", ec: "1.2" });
  const [lastRot, setLastRot] = useState(new Date().toISOString());

  // Carga ultra-simple
  useEffect(() => {
    const saved = localStorage.getItem("hydro_v21");
    if (saved) {
      const d = JSON.parse(saved);
      setPlants(d.plants || []);
      setConfig(d.config || { vol: "20", targetEC: "1.4", ph: "6.0", ec: "1.2" });
      setLastRot(d.lastRot || new Date().toISOString());
      setIsSetup(d.isSetup || false);
    }
  }, []);

  // Guardado automático
  useEffect(() => {
    if (isSetup) {
      localStorage.setItem("hydro_v21", JSON.stringify({ isSetup, plants, config, lastRot }));
    }
  }, [isSetup, plants, config, lastRot]);

  const daysRot = Math.floor((Date.now() - new Date(lastRot).getTime()) / 86400000);

  // Cálculos manuales directos para evitar errores de memoria
  const getAlerts = () => {
    const alerts = [];
    const v = parseFloat(config.vol) || 0;
    const ph = parseFloat(config.ph) || 0;
    const ec = parseFloat(config.ec) || 0;
    const tEc = parseFloat(config.targetEC) || 1.4;

    if (v > 0) {
      if (ph > 6.2) alerts.push({ t: "pH ALTO", m: `${((ph - 6.0) * v * 1.5).toFixed(0)}ml pH Down`, c: "bg-purple-600" });
      if (ph < 5.6 && ph > 0) alerts.push({ t: "pH BAJO", m: `${((6.0 - ph) * v * 1.5).toFixed(0)}ml pH Up`, c: "bg-pink-600" });
      if (ec < tEc && ec > 0) alerts.push({ t: "NUTRIENTES", m: `${(((tEc - ec) / 0.1) * v * 0.25).toFixed(1)}ml A+B`, c: "bg-blue-600" });
      if (daysRot >= 7) alerts.push({ t: "ROTACIÓN", m: "Toca cosechar Nivel 3", c: "bg-orange-600" });
    }
    return alerts;
  };

  if (!isAuth && !isSetup) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center p-6">
        <div className="bg-white p-8 rounded-2xl text-center">
          <h2 className="font-black mb-4">PIN: 1234</h2>
          <input type="password" onChange={e => e.target.value === "1234" && setIsAuth(true)} className="border-2 p-2 text-center text-2xl w-32" />
        </div>
      </div>
    );
  }

  if (!isSetup) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <div className="bg-white p-8 rounded-3xl shadow-lg w-full max-w-sm">
          <h2 className="font-black text-center mb-6 text-green-700">CONFIGURACIÓN</h2>
          <label className="text-xs font-bold">LITROS DEPÓSITO</label>
          <input type="number" value={config.vol} onChange={e => setConfig({...config, vol: e.target.value})} className="w-full p-4 bg-slate-100 rounded-xl mb-4 text-xl font-bold text-center" />
          <button onClick={() => setIsSetup(true)} className="w-full bg-slate-900 text-white p-4 rounded-xl font-black">EMPEZAR</button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 pb-20 font-sans">
      <header className="bg-white p-4 border-b flex justify-between items-center sticky top-0 z-50">
        <b className="text-green-700 italic">HYDROCARU V21</b>
        <span className="bg-slate-200 px-3 py-1 rounded-full text-xs font-bold">{config.vol}L</span>
      </header>

      <main className="p-4 max-w-md mx-auto">
        <Tabs value={tab} onValueChange={setTab}>
          <TabsList className="grid grid-cols-5 mb-6 bg-white border rounded-xl overflow-hidden h-12">
            <TabsTrigger value="overview"><Activity size={18}/></TabsTrigger>
            <TabsTrigger value="measure"><Beaker size={18}/></TabsTrigger>
            <TabsTrigger value="tower"><Layers size={18}/></TabsTrigger>
            <TabsTrigger value="tips"><Lightbulb size={18}/></TabsTrigger>
            <TabsTrigger value="settings"><Trash2 size={18}/></TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-3">
            {getAlerts().map((a, i) => (
              <div key={i} className={`${a.c} text-white p-4 rounded-2xl shadow-md`}>
                <p className="text-[10px] font-black opacity-80">{a.t}</p>
                <p className="text-xl font-black">{a.m}</p>
              </div>
            ))}
            {getAlerts().length === 0 && <div className="p-10 text-center border-2 border-dashed rounded-3xl text-slate-400 font-bold">TODO EN ORDEN</div>}
          </TabsContent>

          <TabsContent value="measure" className="bg-white p-6 rounded-3xl border shadow-sm space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div><label className="text-[10px] font-bold">pH</label><input type="number" step="0.1" value={config.ph} onChange={e => setConfig({...config, ph: e.target.value})} className="w-full p-3 bg-slate-50 border rounded-xl text-center font-bold" /></div>
              <div><label className="text-[10px] font-bold">EC</label><input type="number" step="0.1" value={config.ec} onChange={e => setConfig({...config, ec: e.target.value})} className="w-full p-3 bg-slate-50 border rounded-xl text-center font-bold" /></div>
            </div>
            <button onClick={() => setTab("overview")} className="w-full bg-slate-900 text-white p-4 rounded-xl font-black">CALCULAR</button>
          </TabsContent>

          <TabsContent value="tower" className="space-y-6">
            <button onClick={() => { if(confirm('¿Rotar?')) { setPlants(plants.filter(p => p.l !== 3).map(p => ({...p, l: p.l + 1}))); setLastRot(new Date().toISOString()); } }} className="w-full bg-orange-600 text-white p-5 rounded-2xl font-black shadow-lg">COSECHAR N3 Y ROTAR</button>
            {[1, 2, 3].map(l => (
              <div key={l}>
                <p className="text-[10px] font-black text-slate-400 mb-2 uppercase">Nivel {l} {l===1?'(ARRIBA)':l===3?'(ABAJO)':'(CENTRO)'}</p>
                <div className="grid grid-cols-3 gap-2 bg-slate-100 p-2 rounded-2xl">
                  {[1,2,3,4,5,6].map(p => {
                    const found = plants.find(x => x.l === l && x.p === p);
                    return (
                      <button key={p} onClick={() => { if(found) { setPlants(plants.filter(x => x.id !== found.id)) } else { const v = prompt("Variedad: Romana, Iceberg, Roble, Lollo, Trocadero"); if(v) setPlants([...plants, {id: Date.now(), l, p, v}]) } }} className={`aspect-square rounded-xl border-2 flex items-center justify-center text-[8px] font-black ${found ? 'bg-green-500 text-white border-white' : 'bg-white text-slate-300'}`}>
                        {found ? found.v : <Plus size={14}/>}
                      </button>
                    )
                  })}
                </div>
              </div>
            ))}
          </TabsContent>

          <TabsContent value="tips" className="space-y-4">
            <div className="bg-orange-50 p-6 rounded-3xl border-2 border-orange-200">
              <h3 className="font-black text-orange-700 mb-2">LANA DE ROCA</h3>
              <p className="text-xs font-bold leading-relaxed">
                1. Sumergir 24h en agua pH 5.5 (la lana virgen es pH 8.0).<br/>
                2. NUNCA estrujar la lana, solo sacudir. Si la aprietas, matas el oxígeno.
              </p>
            </div>
            
            <div className="bg-blue-50 p-6 rounded-3xl border-2 border-blue-200">
              <h3 className="font-black text-blue-700 mb-2">OXÍGENO</h3>
              <p className="text-xs font-bold leading-relaxed">
                Si el agua sube de 25°C, las raíces se pudren. Usa botellas de hielo en el depósito en verano.
              </p>
            </div>
          </TabsContent>

          <TabsContent value="settings">
            <button onClick={() => { localStorage.clear(); window.location.reload(); }} className="w-full bg-red-600 text-white p-6 rounded-2xl font-black">RESETEAR TODO</button>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}
