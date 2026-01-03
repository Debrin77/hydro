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
  // --- SEGURIDAD ---
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [pinInput, setPinInput] = useState("");
  const MASTER_PIN = "1234"; 

  // --- ESTADOS DE LA APP ---
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

  // --- CARGA Y GUARDADO ---
  useEffect(() => {
    const saved = localStorage.getItem("hydroCaru_V_FINAL_SECURE");
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
      localStorage.setItem("hydroCaru_V_FINAL_SECURE", JSON.stringify({
        isSetupComplete, plants, params, initialVol, history, lastRotation
      }));
    }
  }, [isSetupComplete, plants, params, initialVol, history, lastRotation]);

  const handleManualRotation = () => {
    if(confirm('¿Confirmas la rotación? El nivel 3 se cosecha.')) {
      const remainingPlants = plants.filter(p => p.level !== 3);
      const rotatedPlants = remainingPlants.map(p => ({ ...p, level: p.level + 1 }));
      setPlants(rotatedPlants);
      setLastRotation(new Date().toISOString());
      alert('¡Rotación completada!');
    }
  };

  const systemStatus = useMemo(() => {
    const ph = parseFloat(params.pH) || 0;
    const ec = parseFloat(params.ec) || 0;
    const currentVol = parseFloat(params.waterVol) || 0;
    const maxVol = parseFloat(initialVol) || 20;
    const targetEC = parseFloat(params.manualTargetEC) || 1.2;
    const alerts = [];
    
    if (currentVol < maxVol && (maxVol - currentVol) >= 0.5) {
      alerts.push({ title: 'RELLENAR AGUA', val: `${(maxVol - currentVol).toFixed(1)} L`, desc: 'Faltan para nivel óptimo', color: 'bg-cyan-600', icon: <Droplets /> });
    }
    if (ph > 6.2) alerts.push({ title: 'pH ALTO', val: ((ph - 6.0) * currentVol * 0.1).toFixed(1) + ' ml', desc: 'Añadir pH DOWN', color: 'bg-purple-600', icon: <ArrowDownCircle /> });
    if (ph < 5.8 && ph > 0) alerts.push({ title: 'pH BAJO', val: ((6.0 - ph) * currentVol * 0.1).toFixed(1) + ' ml', desc: 'Añadir pH UP', color: 'bg-pink-600', icon: <ArrowDownCircle className="rotate-180" /> });
    if (ec < targetEC && ec > 0) {
      const nutrients = ((targetEC - ec) / 0.1) * currentVol * 0.25;
      alerts.push({ title: 'EC BAJA', val: nutrients.toFixed(1) + ' ml', desc: `Añadir Nutrientes`, color: 'bg-blue-700', icon: <FlaskConical /> });
    }
    return { alerts };
  }, [params, initialVol]);

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center p-6 text-slate-800">
        <Card className="w-full max-w-xs p-8 bg-white rounded-[2.5rem] text-center shadow-2xl">
          <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-4"><Lock className="w-8 h-8" /></div>
          <h2 className="text-xl font-black uppercase mb-6">Acceso Privado</h2>
          <input type="password" placeholder="PIN" className="w-full text-center text-3xl font-black bg-slate-100 rounded-2xl p-4 mb-4 outline-none focus:border-green-500 border-2 transition-all" value={pinInput} onChange={(e) => { setPinInput(e.target.value); if(e.target.value === MASTER_PIN) setIsAuthenticated(true); }} />
        </Card>
      </div>
    );
  }

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

  return (
    <div className="min-h-screen bg-slate-50 pb-32 text-slate-800">
      <header className="bg-white border-b p-6 flex justify-between items-center sticky top-0 z-50">
        <div className="flex items-center gap-3">
           <div className="w-10 h-10 rounded-full overflow-hidden border-2 border-green-400 bg-slate-100">
             <img src="TU_URL_DEL_LOGO" alt="L" className="w-full h-full object-cover" />
           </div>
           <div className="text-2xl font-[900] tracking-tighter bg-gradient-to-r from-green-800 to-green-500 bg-clip-text text-transparent italic">
             HydroCaru
           </div>
        </div>
        <Badge className="bg-slate-900 text-white font-black">{params.waterVol}L / {initialVol}L</Badge>
      </header>

      <main className="container mx-auto p-4 max-w-md">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid grid-cols-6 h-16 bg-white border-2 shadow-xl rounded-[1.5rem] p-1 mb-8">
            <TabsTrigger value="overview"><Activity/></TabsTrigger>
            <TabsTrigger value="measure"><Beaker/></TabsTrigger>
            <TabsTrigger value="tower"><Layers/></TabsTrigger>
            <TabsTrigger value="master_tips"><Lightbulb/></TabsTrigger>
            <TabsTrigger value="history"><History/></TabsTrigger>
            <TabsTrigger value="settings"><Trash2/></TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-4">
            {systemStatus.alerts.map((alert, i) => (
              <Card key={i} className={`${alert.color} text-white p-6 rounded-[2.5rem] flex items-center gap-6 border-none`}>
                <div className="w-10 h-10">{alert.icon}</div>
                <div><p className="text-[10px] font-black uppercase opacity-70">{alert.title}</p><p className="text-3xl font-black">{alert.val}</p><p className="text-[10px] font-bold uppercase">{alert.desc}</p></div>
              </Card>
            ))}
            {systemStatus.alerts.length === 0 && (
              <Card className="p-8 rounded-[2.5rem] bg-green-50 text-green-700 border-2 border-green-100 flex items-center justify-center gap-4"><Check/> <span className="font-black uppercase text-sm">Todo en Orden</span></Card>
            )}
          </TabsContent>

          <TabsContent value="master_tips" className="space-y-4 pb-10">
            <h2 className="text-xl font-black italic text-slate-800 ml-2 mb-4">CONSEJOS MAESTROS</h2>
            <Card className="p-5 rounded-[2rem] bg-white border-2 border-green-100">
              <div className="flex items-center gap-3 mb-3 text-green-600"><Sprout size={18}/><h3 className="font-black text-xs uppercase">Trasplante (Raíz Desnuda)</h3></div>
              <p className="text-[11px] font-medium leading-relaxed text-slate-600">Lava el cepellón en agua templada (20-24°C) agitándolo suavemente. Una gota de agua oxigenada elimina patógenos.</p>
            </Card>
            <Card className="p-5 rounded-[2rem] bg-white border-2 border-blue-100">
              <div className="flex items-center gap-3 mb-3 text-blue-600"><Layers size={18}/><h3 className="font-black text-xs uppercase">Lana de Roca</h3></div>
              <p className="text-[11px] font-medium leading-relaxed text-slate-600">Sumerge el dado en agua pH 5.5 por 1 hora. Haz un corte lateral para insertar la plántula sin dañar la raíz.</p>
            </Card>
            <Card className="p-5 rounded-[2rem] bg-slate-900 text-white">
              <div className="flex items-center gap-3 mb-3 text-yellow-400"><Activity size={18}/><h3 className="font-black text-xs uppercase">Tabla de Valores</h3></div>
              <div className="grid grid-cols-3 text-[10px] font-bold border-t border-slate-700 pt-2 gap-2">
                <span>FASE</span><span className="text-center">pH</span><span className="text-right">EC</span>
                <span className="text-slate-400">Nivel 1</span><span className="text-center">5.8</span><span className="text-right">0.8</span>
                <span className="text-slate-400">Mixto</span><span className="text-center text-yellow-400">6.0</span><span className="text-right text-yellow-400">1.4</span>
              </div>
            </Card>
            <Card className="p-5 rounded-[2rem] bg-white border-2 border-orange-100">
              <div className="flex items-center gap-3 mb-3 text-orange-600"><Check size={18}/><h3 className="font-black text-xs uppercase">Cosecha Pro</h3></div>
              <p className="text-[11px] font-medium leading-relaxed text-slate-600">Cosecha al amanecer. 24h antes usa solo agua pura para mejorar el sabor. ¡Hielo tras cortar para crujiente máximo!</p>
            </Card>
          </TabsContent>

          <TabsContent value="measure">
            <Card className="p-8 rounded-[3rem] space-y-4 bg-white shadow-2xl">
              <div className="bg-blue-600 p-5 rounded-3xl text-white text-center">
                <label className="text-[9px] font-black uppercase">EC Objetivo</label>
                <input type="number" step="0.1" value={params.manualTargetEC} onChange={e => setParams({...params, manualTargetEC: e.target.value})} className="w-full bg-transparent text-4xl outline-none text-center font-black" />
              </div>
              <div className="grid grid-cols-2 gap-3 font-black text-center">
                <div className="bg-slate-50 p-4 rounded-3xl border-2"><label className="text-[8px] text-slate-400 block uppercase">pH</label><input type="number" step="0.1" value={params.pH} onChange={e => setParams({...params, pH: e.target.value})} className="w-full bg-transparent text-2xl text-center outline-none" /></div>
                <div className="bg-slate-50 p-4 rounded-3xl border-2"><label className="text-[8px] text-slate-400 block uppercase">EC</label><input type="number" step="0.1" value={params.ec} onChange={e => setParams({...params, ec: e.target.value})} className="w-full bg-transparent text-2xl text-center outline-none" /></div>
              </div>
              <button onClick={() => { setHistory([{...params, id: Date.now(), date: new Date().toLocaleString()}, ...history]); setActiveTab("overview"); }} className="w-full bg-slate-900 text-white p-6 rounded-[2rem] font-black uppercase">Guardar</button>
            </Card>
          </TabsContent>

          <TabsContent value="tower" className="space-y-6">
            {[1, 2, 3].map(lvl => (
              <div key={lvl}><p className="text-[10px] font-black text-slate-400 uppercase mb-2 ml-2">Nivel {lvl}</p><LevelGrid lvl={lvl} /></div>
            ))}
            <Card className="p-6 rounded-[2rem] bg-slate-900 text-white text-center">
                <p className="text-[10px] font-black uppercase text-slate-500 mb-2">Próxima Rotación</p>
                <p className="text-2xl font-black">{new Date(new Date(lastRotation).getTime() + 14 * 86400000).toLocaleDateString()}</p>
                <button onClick={handleManualRotation} className="mt-4 text-[8px] bg-green-600 px-6 py-2 rounded-full font-black uppercase">Rotar Ahora</button>
             </Card>
          </TabsContent>

          <TabsContent value="history" className="space-y-3">
             {history.map(h => (
                <Card key={h.id} className="p-4 rounded-[1.5rem] bg-white border-2 font-black shadow-sm flex flex-col gap-2">
                  <p className="text-[8px] text-slate-400">{h.date}</p>
                  <div className="flex justify-between items-center text-[10px]">
                    <span>pH {h.pH} | EC {h.ec}</span>
                    <span className="text-blue-600">{h.waterVol}L</span>
                  </div>
                </Card>
             ))}
          </TabsContent>

          <TabsContent value="settings" className="py-10">
             <button onClick={() => {if(confirm('¿Borrar todo?')) {localStorage.removeItem("hydroCaru_V_FINAL_SECURE"); window.location.reload();}}} className="w-full bg-red-100 text-red-600 p-8 rounded-[3rem] font-black uppercase text-[10px]">Reset Sistema</button>
          </TabsContent>
        </Tabs>
      </main>

      {showPlantSelector && (
          <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[999] flex items-end p-4">
            <div className="bg-white w-full max-w-md mx-auto rounded-[3.5rem] p-10">
              <h3 className="text-center font-black uppercase text-xs mb-6 text-slate-400">Variedad</h3>
              {Object.keys(VARIETY_CONFIG).map(v => ( <button key={v} onClick={() => { setPlants([...plants, {id: Date.now(), variety: v, level: showPlantSelector.lvl, position: showPlantSelector.pos}]); setShowPlantSelector(null); }} className={`w-full p-4 mb-2 rounded-2xl font-black text-left ${VARIETY_CONFIG[v].bg} text-white`}>{v}</button> ))}
              <button onClick={() => setShowPlantSelector(null)} className="w-full mt-4 p-2 text-slate-400 font-bold uppercase text-[10px]">Cerrar</button>
            </div>
          </div>
      )}
    </div>
  );
}
