"use client"

import React, { useState, useEffect, useMemo } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { 
  Sprout, Activity, Layers, Beaker, Calendar as CalendarIcon, 
  History, Plus, Trash2, FlaskConical, 
  ArrowDownCircle, Droplets, Check, Gauge, Lock, Lightbulb
} from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Card } from "@/components/ui/card"

// --- CONFIGURACIÓN VISUAL ---
const VARIETY_CONFIG: { [key: string]: { color: string, bg: string } } = {
  "Romana": { color: "text-emerald-700", bg: "bg-emerald-400" },
  "Iceberg": { color: "text-blue-700", bg: "bg-blue-300" },
  "Hoja de Roble": { color: "text-red-700", bg: "bg-red-400" },
  "Lollo Rosso": { color: "text-purple-700", bg: "bg-purple-400" },
  "Trocadero": { color: "text-lime-700", bg: "bg-lime-400" }
};

export default function HydroponicTowerApp() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [pinInput, setPinInput] = useState("");
  const MASTER_PIN = "1234"; 

  const [isSetupComplete, setIsSetupComplete] = useState(false);
  const [setupStep, setSetupStep] = useState(1);
  const [activeTab, setActiveTab] = useState("overview");
  const [plants, setPlants] = useState<any[]>([]);
  const [history, setHistory] = useState<any[]>([]);
  const [lastRotation, setLastRotation] = useState<string>(new Date().toISOString());
  const [showPlantSelector, setShowPlantSelector] = useState<{lvl: number, pos: number} | null>(null);
  const [initialVol, setInitialVol] = useState("20");
  const [params, setParams] = useState({ 
    pH: "6.0", ec: "1.2", waterVol: "20", temp: "22", manualTargetEC: "1.2" 
  });

  useEffect(() => {
    const saved = localStorage.getItem("hydroCaru_ULTIMATE_V5");
    if (saved) {
      const d = JSON.parse(saved);
      if (d.isSetupComplete) {
        setIsSetupComplete(true);
        setPlants(d.plants || []);
        setParams(d.params);
        setInitialVol(d.initialVol || "20");
        setHistory(d.history || []);
        setLastRotation(d.lastRotation || new Date().toISOString());
      }
    }
  }, []);

  useEffect(() => {
    if (isSetupComplete) {
      localStorage.setItem("hydroCaru_ULTIMATE_V5", JSON.stringify({
        isSetupComplete, plants, params, initialVol, history, lastRotation
      }));
    }
  }, [isSetupComplete, plants, params, initialVol, history, lastRotation]);

  const handleManualRotation = () => {
    if(confirm('¿Confirmar rotación?')) {
      const remainingPlants = plants.filter(p => p.level !== 3);
      const rotatedPlants = remainingPlants.map(p => ({ ...p, level: p.level + 1 }));
      setPlants(rotatedPlants);
      setLastRotation(new Date().toISOString());
    }
  };

  const systemStatus = useMemo(() => {
    const ph = parseFloat(params.pH) || 0;
    const ec = parseFloat(params.ec) || 0;
    const currentVol = parseFloat(params.waterVol) || 0;
    const maxVol = parseFloat(initialVol) || 20;
    const targetEC = parseFloat(params.manualTargetEC) || 1.2;
    const alerts = [];
    if (currentVol < maxVol && (maxVol - currentVol) >= 0.5) alerts.push({ title: 'RELLENAR AGUA', val: `${(maxVol - currentVol).toFixed(1)} L`, desc: 'Faltan', color: 'bg-cyan-600', icon: <Droplets /> });
    if (ph > 6.2) alerts.push({ title: 'pH ALTO', val: ((ph - 6.0) * currentVol * 10).toFixed(0) + ' ml', desc: 'pH DOWN', color: 'bg-purple-600', icon: <ArrowDownCircle /> });
    if (ph < 5.8 && ph > 0) alerts.push({ title: 'pH BAJO', val: ((6.0 - ph) * currentVol * 10).toFixed(0) + ' ml', desc: 'pH UP', color: 'bg-pink-600', icon: <ArrowDownCircle className="rotate-180" /> });
    if (ec < targetEC && ec > 0) {
      const nutrients = ((targetEC - ec) / 0.1) * currentVol * 0.25;
      alerts.push({ title: 'EC BAJA', val: nutrients.toFixed(1) + ' ml', desc: `Nutrientes A+B`, color: 'bg-blue-700', icon: <FlaskConical /> });
    }
    return { alerts };
  }, [params, initialVol]);

  const LevelGrid = ({ lvl }: { lvl: number }) => (
    <div className="bg-slate-50 p-4 rounded-[2rem] border-2 border-dashed border-slate-200 grid grid-cols-3 gap-3">
      {[1, 2, 3, 4, 5, 6].map(pos => {
        const p = plants.find(x => x.level === lvl && x.position === pos);
        return (
          <button key={pos} onClick={() => { if (p) setPlants(plants.filter(x => x.id !== p.id)); else setShowPlantSelector({ lvl, pos }); }} className={`aspect-square rounded-2xl flex flex-col items-center justify-center border-2 transition-all ${p ? `${VARIETY_CONFIG[p.variety]?.bg} border-white text-white shadow-md` : 'bg-white border-slate-200 text-slate-300'}`}>
            {p ? <Sprout className="w-6 h-6" /> : <Plus className="w-5 h-5" />}
            {p && <span className="text-[7px] font-black uppercase mt-1">{p.variety.split(' ')[0]}</span>}
          </button>
        );
      })}
    </div>
  );

  const SelectorPopUp = () => (
    showPlantSelector && (
      <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[9999] flex items-end p-4">
        <div className="bg-white w-full max-w-md mx-auto rounded-[3.5rem] p-10 shadow-2xl animate-in slide-in-from-bottom">
          <h3 className="text-center font-black uppercase text-xs mb-8 text-slate-400">Seleccionar Variedad</h3>
          <div className="grid grid-cols-1 gap-3">
            {Object.keys(VARIETY_CONFIG).map(v => (
              <button key={v} onClick={() => { setPlants([...plants, {id: Date.now(), variety: v, level: showPlantSelector.lvl, position: showPlantSelector.pos}]); setShowPlantSelector(null); }} className={`w-full p-5 rounded-2xl font-black text-left ${VARIETY_CONFIG[v].bg} text-white active:scale-95 transition-transform`}>{v}</button>
            ))}
          </div>
          <button onClick={() => setShowPlantSelector(null)} className="w-full mt-8 p-2 text-slate-400 font-bold uppercase text-[10px]">Cancelar</button>
        </div>
      </div>
    )
  );

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center p-6 text-slate-800">
        <Card className="w-full max-w-xs p-8 bg-white rounded-[2.5rem] text-center shadow-2xl">
          <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-4"><Lock size={32} /></div>
          <h2 className="text-xl font-black uppercase mb-6">Acceso Privado</h2>
          <input type="password" placeholder="PIN" className="w-full text-center text-3xl font-black bg-slate-100 rounded-2xl p-4 outline-none border-2 focus:border-green-500" value={pinInput} onChange={(e) => { setPinInput(e.target.value); if(e.target.value === MASTER_PIN) setIsAuthenticated(true); }} />
        </Card>
      </div>
    );
  }

  if (!isSetupComplete) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4">
        <Card className="w-full max-w-md p-8 bg-white rounded-[3rem] shadow-2xl text-center text-slate-800 relative">
          <div className="text-3xl font-[900] tracking-tight bg-gradient-to-r from-green-800 to-green-500 bg-clip-text text-transparent italic mb-8 pr-2">HydroCaru</div>
          {setupStep === 1 && (
            <div className="space-y-6">
              <h3 className="text-xl font-black uppercase">Depósito (L)</h3>
              <input type="number" value={initialVol} onChange={e => {setInitialVol(e.target.value); setParams({...params, waterVol: e.target.value})}} className="w-full bg-slate-50 rounded-3xl p-6 text-5xl font-black text-center border-2 border-green-100 outline-none" />
              <button onClick={() => setSetupStep(2)} className="w-full bg-slate-900 text-white p-6 rounded-[2rem] font-black uppercase">Siguiente</button>
            </div>
          )}
          {setupStep === 2 && (
            <div className="space-y-6">
              <h3 className="text-xl font-black uppercase">Carga Nivel 1</h3>
              <LevelGrid lvl={1} />
              <button disabled={plants.filter(p => p.level === 1).length === 0} onClick={() => setSetupStep(3)} className="w-full bg-slate-900 text-white p-6 rounded-[2rem] font-black uppercase disabled:opacity-20">Siguiente</button>
            </div>
          )}
          {setupStep === 3 && (
            <div className="space-y-6">
              <h3 className="text-xl font-black uppercase">EC Objetivo</h3>
              <div className="bg-blue-600 p-6 rounded-3xl text-white">
                <input type="number" step="0.1" value={params.manualTargetEC} onChange={e => setParams({...params, manualTargetEC: e.target.value})} className="w-full bg-transparent text-5xl font-black text-center outline-none" />
              </div>
              <button onClick={() => setIsSetupComplete(true)} className="w-full bg-green-600 text-white p-6 rounded-[2rem] font-black uppercase shadow-xl">Iniciar</button>
            </div>
          )}
        </Card>
        <SelectorPopUp />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 pb-32 text-slate-800">
      <header className="bg-white border-b p-6 flex justify-between items-center sticky top-0 z-50">
        <div className="flex items-center gap-3">
           <div className="w-10 h-10 rounded-full overflow-hidden border-2 border-green-400 bg-slate-100 flex-shrink-0">
             <img src="TU_LOGO" alt="L" className="w-full h-full object-cover" />
           </div>
           <div className="text-2xl font-[900] tracking-tight bg-gradient-to-r from-green-800 to-green-500 bg-clip-text text-transparent italic pr-2">HydroCaru</div>
        </div>
        <Badge className="bg-slate-900 text-white font-black">{params.waterVol}L / {initialVol}L</Badge>
      </header>

      <main className="container mx-auto p-4 max-w-md">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid grid-cols-6 h-16 bg-white border-2 shadow-xl rounded-[1.5rem] p-1 mb-8">
            <TabsTrigger value="overview"><Activity/></TabsTrigger>
            <TabsTrigger value="measure"><Beaker/></TabsTrigger>
            <TabsTrigger value="tower"><Layers/></TabsTrigger>
            <TabsTrigger value="tips"><Lightbulb/></TabsTrigger>
            <TabsTrigger value="history"><History/></TabsTrigger>
            <TabsTrigger value="settings"><Trash2/></TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-4">
            {systemStatus.alerts.map((alert, i) => (
              <Card key={i} className={`${alert.color} text-white p-6 rounded-[2.5rem] flex items-center gap-6 border-none`}>
                <div className="w-10 h-10">{alert.icon}</div>
                <div><p className="text-[10px] font-black uppercase opacity-70">{alert.title}</p><p className="text-3xl font-black">{alert.val}</p></div>
              </Card>
            ))}
            {systemStatus.alerts.length === 0 && <Card className="p-8 rounded-[2.5rem] bg-green-50 text-green-700 border-2 border-green-100 flex items-center justify-center gap-4 italic font-black uppercase text-sm">Todo OK</Card>}
          </TabsContent>

          <TabsContent value="measure" className="space-y-4">
            <Card className="p-8 rounded-[3rem] bg-white shadow-xl space-y-4">
              <div className="bg-blue-600 p-6 rounded-3xl text-white text-center">
                <label className="text-[9px] font-black uppercase opacity-70">EC Objetivo</label>
                <input type="number" step="0.1" value={params.manualTargetEC} onChange={e => setParams({...params, manualTargetEC: e.target.value})} className="w-full bg-transparent text-4xl text-center font-black outline-none" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-slate-50 p-4 rounded-2xl border-2 font-black text-center"><label className="text-[9px] text-slate-400 block uppercase">pH</label><input type="number" step="0.1" value={params.pH} onChange={e => setParams({...params, pH: e.target.value})} className="w-full bg-transparent text-2xl text-center outline-none" /></div>
                <div className="bg-slate-50 p-4 rounded-2xl border-2 font-black text-center"><label className="text-[9px] text-slate-400 block uppercase">EC</label><input type="number" step="0.1" value={params.ec} onChange={e => setParams({...params, ec: e.target.value})} className="w-full bg-transparent text-2xl text-center outline-none" /></div>
                <div className="bg-cyan-50 p-4 rounded-2xl border-2 font-black text-center text-cyan-700"><label className="text-[9px] block uppercase">Agua (L)</label><input type="number" value={params.waterVol} onChange={e => setParams({...params, waterVol: e.target.value})} className="w-full bg-transparent text-2xl text-center outline-none font-black" /></div>
                <div className="bg-orange-50 p-4 rounded-2xl border-2 font-black text-center text-orange-700"><label className="text-[9px] block uppercase">Temp °C</label><input type="number" value={params.temp} onChange={e => setParams({...params, temp: e.target.value})} className="w-full bg-transparent text-2xl text-center outline-none font-black" /></div>
              </div>
              <button onClick={() => { setHistory([{...params, id: Date.now(), date: new Date().toLocaleString()}, ...history]); setActiveTab("overview"); }} className="w-full bg-slate-900 text-white p-6 rounded-[2rem] font-black uppercase">Registrar</button>
            </Card>
          </TabsContent>

          <TabsContent value="tower" className="space-y-6">
            {[1, 2, 3].map(lvl => (
              <div key={lvl}><p className="text-[10px] font-black text-slate-400 uppercase mb-2 ml-4">Nivel {lvl}</p><LevelGrid lvl={lvl} /></div>
            ))}
            <Card className="p-8 rounded-[2.5rem] bg-slate-900 text-white text-center shadow-xl">
              <p className="text-[10px] font-black uppercase text-slate-500 mb-1">Próxima Rotación</p>
              <p className="text-2xl font-black italic">{new Date(new Date(lastRotation).getTime() + 14 * 86400000).toLocaleDateString()}</p>
              <button onClick={handleManualRotation} className="mt-4 bg-green-600 px-6 py-3 rounded-xl font-black uppercase text-[10px]">Rotar Hoy</button>
            </Card>
          </TabsContent>

          <TabsContent value="tips" className="space-y-4">
            <h2 className="text-xl font-black italic ml-2">CONSEJOS MAESTROS</h2>
            <Card className="p-6 rounded-[2.2rem] bg-white border-2 border-green-100 text-[11px] font-medium leading-relaxed">
              <div className="flex items-center gap-2 mb-2 text-green-600 font-black uppercase text-[10px]"><Sprout size={16}/> Trasplante</div>
              Lava raíces en agua templada (20-24°C). Agita como una bolsa de té. ¡Añade una gota de agua oxigenada!
            </Card>
            <Card className="p-6 rounded-[2.2rem] bg-white border-2 border-blue-100 text-[11px] font-medium leading-relaxed">
              <div className="flex items-center gap-2 mb-2 text-blue-600 font-black uppercase text-[10px]"><Layers size={16}/> Lana de Roca</div>
              Sumerge dados en agua pH 5.5 (1h). Corte lateral "pan de perrito" para el tallo. Raíces libres abajo.
            </Card>
            <Card className="p-6 rounded-[2.2rem] bg-slate-900 text-white shadow-xl">
              <div className="flex items-center gap-2 mb-3 text-yellow-400 font-black uppercase text-[10px]"><Activity size={16}/> Tabla Maestro</div>
              <div className="grid grid-cols-3 text-[10px] border-t border-slate-700 pt-2 font-bold uppercase">
                <span>FASE</span><span className="text-center">pH</span><span className="text-right">EC</span>
                <span className="text-slate-400">Lvl 1</span><span className="text-center">5.8</span><span className="text-right">0.8</span>
                <span className="text-yellow-400 italic">Punto Dulce</span><span className="text-center text-yellow-400">6.0</span><span className="text-right text-yellow-400">1.4</span>
              </div>
            </Card>
            <Card className="p-6 rounded-[2.2rem] bg-white border-2 border-orange-100 text-[11px] font-medium leading-relaxed">
              <div className="flex items-center gap-2 mb-2 text-orange-600 font-black uppercase text-[10px]"><Check size={16}/> Cosecha</div>
              Cosecha al amanecer. 24h antes usa solo agua pura. ¡Hielo tras cortar para crujiente máximo!
            </Card>
          </TabsContent>

          <TabsContent value="history" className="space-y-3">
             {history.map(h => (
                <Card key={h.id} className="p-4 rounded-[1.5rem] bg-white border-2 font-black shadow-sm flex flex-col gap-2">
                  <p className="text-[8px] text-slate-400">{h.date}</p>
                  <div className="flex justify-between text-xs italic">
                    <span>pH {h.pH} | EC {h.ec}</span>
                    <span className="text-blue-600">{h.waterVol}L</span>
                  </div>
                </Card>
             ))}
          </TabsContent>

          <TabsContent value="settings" className="py-10">
             <button onClick={() => {if(confirm('¿Borrar todo?')) {localStorage.removeItem("hydroCaru_ULTIMATE_V5"); window.location.reload();}}} className="w-full bg-red-100 text-red-600 p-10 rounded-[2.5rem] font-black uppercase text-xs border-2 border-red-200">Reset Total</button>
          </TabsContent>
        </Tabs>
      </main>

      <SelectorPopUp />
    </div>
  );
}
