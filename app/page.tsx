"use client"

import React, { useState, useEffect } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { 
  Sprout, Activity, Layers, Beaker, Calendar as CalendarIcon, 
  History, Plus, Trash2, FlaskConical, 
  ArrowDownCircle, ArrowUpCircle, AlertTriangle, RefreshCw, Check, Clock, Droplets
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
  const [activeTab, setActiveTab] = useState("overview");
  const [plants, setPlants] = useState<any[]>([]);
  const [history, setHistory] = useState<any[]>([]);
  const [lastRotation, setLastRotation] = useState<string>(new Date().toISOString());
  const [showPlantSelector, setShowPlantSelector] = useState<{lvl: number, pos: number} | null>(null);
  const [params, setParams] = useState({ pH: "6.0", ec: "1.2", waterVol: "20" });

  useEffect(() => {
    const saved = localStorage.getItem("hydroCaru_Final_PRO");
    if (saved) {
      const d = JSON.parse(saved);
      if (d.isSetupComplete) {
        setIsSetupComplete(true);
        setPlants(d.plants || []);
        setParams(d.params);
        setHistory(d.history || []);
        setLastRotation(d.lastRotation || new Date().toISOString());
      }
    }
  }, []);

  useEffect(() => {
    if (isSetupComplete) {
      localStorage.setItem("hydroCaru_Final_PRO", JSON.stringify({ isSetupComplete, plants, params, history, lastRotation }));
    }
  }, [isSetupComplete, plants, params, history, lastRotation]);

  // --- CÁLCULOS PRO ---
  const currentPH = parseFloat(params.pH) || 0;
  const currentEC = parseFloat(params.ec) || 0;
  const vol = parseFloat(params.waterVol) || 0;
  const targetEC = plants.length > 12 ? 1.6 : plants.length > 6 ? 1.4 : 1.2;

  // Lógica pH
  let phCorr = { active: false, ml: 0, type: "", color: "bg-orange-500" };
  if (currentPH > 6.2) phCorr = { active: true, ml: (currentPH - 6.0) * vol * 0.1, type: "pH DOWN", color: "bg-purple-600" };
  else if (currentPH < 5.8 && currentPH > 0) phCorr = { active: true, ml: (6.0 - currentPH) * vol * 0.1, type: "pH UP", color: "bg-orange-500" };

  // Lógica EC (Baja -> Añadir Nutrientes | Alta -> Añadir Agua)
  let ecCorr = { active: false, amount: 0, unit: "ml", type: "", color: "bg-blue-600" };
  if (currentEC < targetEC && currentEC > 0) {
    ecCorr = { active: true, amount: ((targetEC - currentEC) / 0.1) * vol * 0.25, unit: "ml", type: "Nutrientes (A+B)", color: "bg-blue-600" };
  } else if (currentEC > targetEC + 0.2) {
    // Si la EC es alta, calculamos cuánta agua añadir para diluir
    const waterToAdd = (vol * (currentEC - targetEC)) / targetEC;
    ecCorr = { active: true, amount: waterToAdd, unit: "L", type: "Agua Limpia (Diluir)", color: "bg-cyan-500" };
  }

  const needsRot = (new Date().getTime() - new Date(lastRotation).getTime()) / (1000 * 60 * 60 * 24) >= 14;

  const saveMeasurement = () => {
    const newEntry = {
      ...params,
      id: Date.now(),
      date: new Date().toLocaleString(),
      corr: {
        ph: phCorr.active ? `${phCorr.ml.toFixed(1)}ml ${phCorr.type}` : null,
        ec: ecCorr.active ? `${ecCorr.amount.toFixed(1)}${ecCorr.unit} ${ecCorr.type}` : null
      }
    };
    setHistory([newEntry, ...history]);
    setActiveTab("overview");
  };

  const getDaySchedule = () => {
    const ratio = plants.length / (vol || 1);
    if (ratio > 0.8) return [8, 12, 16, 21];
    if (ratio > 0.4) return [9, 15, 21];
    return [10, 20];
  };

  const renderLevel = (lvl: number) => (
    <div key={lvl} className="bg-white p-4 rounded-3xl border mb-4 shadow-sm">
      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 text-center">Nivel {lvl}</p>
      <div className="grid grid-cols-3 gap-3">
        {[1, 2, 3, 4, 5, 6].map(pos => {
          const p = plants.find(x => x.level === lvl && x.position === pos);
          return (
            <button key={pos} onClick={() => {
              const exists = plants.find(x => x.level === lvl && x.position === pos);
              if (exists) setPlants(plants.filter(x => x.id !== exists.id));
              else setShowPlantSelector({ lvl, pos });
            }} className={`aspect-square rounded-2xl flex flex-col items-center justify-center border-2 ${p ? `${VARIETY_CONFIG[p.variety]?.bg} border-white text-white shadow-md` : 'bg-slate-50 border-dashed border-slate-200 text-slate-300'}`}>
              {p ? <Sprout className="w-6 h-6" /> : <Plus className="w-5 h-5" />}
              {p && <span className="text-[6px] font-black uppercase mt-1">{p.variety.split(' ')[0]}</span>}
            </button>
          );
        })}
      </div>
    </div>
  );

  if (!isSetupComplete) {
    return (
      <div className="min-h-screen bg-slate-100 flex items-center justify-center p-4">
        <Card className="w-full max-w-md p-8 bg-white rounded-[3rem] shadow-2xl text-center">
          <h2 className="text-3xl font-black italic text-green-600 tracking-tighter mb-6">HydroCaru</h2>
          <div className="space-y-4">
            <div className="bg-slate-50 p-4 rounded-2xl border-2 font-black text-left">
              <span className="text-[9px] text-slate-400 uppercase">Litros del Tanque</span>
              <input type="text" value={params.waterVol} onChange={e => setParams({...params, waterVol: e.target.value})} className="w-full bg-transparent text-2xl outline-none" />
            </div>
            <button onClick={() => setIsSetupComplete(true)} className="w-full bg-slate-900 text-white p-6 rounded-3xl font-black">ENTRAR AL PANEL</button>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 pb-32">
      <header className="bg-white border-b p-6 sticky top-0 z-50 flex justify-between items-center shadow-sm">
        <div className="font-black text-green-600 text-2xl italic tracking-tighter">HydroCaru</div>
        <Badge className="bg-slate-900 text-white rounded-full px-4">{params.waterVol}L</Badge>
      </header>

      <main className="container mx-auto p-4 max-w-md">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid grid-cols-6 h-16 bg-white border shadow-xl rounded-2xl p-1 mb-8">
            <TabsTrigger value="overview"><Activity /></TabsTrigger>
            <TabsTrigger value="measure"><Beaker /></TabsTrigger>
            <TabsTrigger value="tower"><Layers /></TabsTrigger>
            <TabsTrigger value="calendar"><CalendarIcon /></TabsTrigger>
            <TabsTrigger value="history"><History /></TabsTrigger>
            <TabsTrigger value="settings"><Trash2 /></TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-4">
            {/* PANEL DE ALERTAS COMBINADAS */}
            <div className="space-y-3">
              {phCorr.active && (
                <Card className={`${phCorr.color} text-white p-6 rounded-[2.5rem] flex items-center gap-6 shadow-lg border-none animate-in slide-in-from-top`}>
                  <ArrowDownCircle className="w-10 h-10" />
                  <div><p className="text-[10px] font-black uppercase opacity-70 mb-1">Ajuste pH</p><p className="text-4xl font-black">{phCorr.ml.toFixed(1)} ml</p><p className="text-[10px] font-bold uppercase">{phCorr.type}</p></div>
                </Card>
              )}
              {ecCorr.active && (
                <Card className={`${ecCorr.color} text-white p-6 rounded-[2.5rem] flex items-center gap-6 shadow-lg border-none animate-in slide-in-from-top`}>
                  {currentEC > targetEC ? <Droplets className="w-10 h-10" /> : <FlaskConical className="w-10 h-10" />}
                  <div><p className="text-[10px] font-black uppercase opacity-70 mb-1">Corrección EC</p><p className="text-4xl font-black">{ecCorr.amount.toFixed(1)} {ecCorr.unit}</p><p className="text-[10px] font-bold uppercase">{ecCorr.type}</p></div>
                </Card>
              )}
              {needsRot && (
                <Card className="bg-red-600 text-white p-6 rounded-[2.5rem] shadow-xl flex items-center gap-4">
                  <RefreshCw className="w-10 h-10 animate-spin-slow" />
                  <div className="flex-1">
                    <p className="text-[10px] font-black uppercase mb-1">Toca Rotación</p>
                    <button onClick={() => { setPlants(plants.filter(p => p.level !== 3).map(p => ({ ...p, level: p.level + 1 }))); setLastRotation(new Date().toISOString()); }} className="w-full bg-white text-red-600 p-2 rounded-xl font-black text-[10px] uppercase">Rotar Ahora</button>
                  </div>
                </Card>
              )}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="bg-white p-8 rounded-[2.5rem] border shadow-sm text-center">
                <p className="text-[10px] font-black text-slate-300 uppercase mb-1">pH</p>
                <p className={`text-5xl font-black ${currentPH < 5.8 || currentPH > 6.2 ? 'text-red-500' : 'text-slate-800'}`}>{params.pH}</p>
              </div>
              <div className="bg-white p-8 rounded-[2.5rem] border shadow-sm text-center">
                <p className="text-[10px] font-black text-slate-300 uppercase mb-1">EC</p>
                <p className={`text-5xl font-black ${currentEC > targetEC + 0.2 ? 'text-cyan-500' : 'text-slate-800'}`}>{params.ec}</p>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="measure">
            <Card className="p-8 rounded-[3rem] space-y-6 shadow-2xl border-none">
              <h2 className="text-center font-black text-2xl italic uppercase tracking-tighter">Nueva Toma</h2>
              <div className="space-y-4">
                <div className="bg-slate-50 p-4 rounded-3xl border-2 font-black text-center"><label className="text-[10px] text-slate-400 uppercase block mb-1">pH</label><input type="text" inputMode="decimal" value={params.pH} onChange={e => setParams({...params, pH: e.target.value})} className="w-full bg-transparent text-4xl outline-none text-center" /></div>
                <div className="bg-slate-50 p-4 rounded-3xl border-2 font-black text-center"><label className="text-[10px] text-slate-400 uppercase block mb-1">EC</label><input type="text" inputMode="decimal" value={params.ec} onChange={e => setParams({...params, ec: e.target.value})} className="w-full bg-transparent text-4xl outline-none text-center" /></div>
                <div className="bg-blue-50 p-4 rounded-3xl border-2 border-blue-100 font-black text-center"><label className="text-[10px] text-blue-400 uppercase block mb-1">Litros Reales</label><input type="text" inputMode="decimal" value={params.waterVol} onChange={e => setParams({...params, waterVol: e.target.value})} className="w-full bg-transparent text-4xl outline-none text-center text-blue-600" /></div>
                <button onClick={saveMeasurement} className="w-full bg-slate-900 text-white p-7 rounded-[2.5rem] font-black text-xl shadow-lg">CALCULAR Y GUARDAR</button>
              </div>
            </Card>
          </TabsContent>

          <TabsContent value="tower" className="space-y-2">
            {[1, 2, 3].map(lvl => renderLevel(lvl))}
          </TabsContent>

          <TabsContent value="calendar" className="space-y-6">
            <Card className="p-6 rounded-[2.5rem] bg-white border shadow-sm">
              <h3 className="font-black uppercase text-[10px] text-slate-400 mb-6 text-center tracking-widest text-balance">Calendario de Muestreo Semanal</h3>
              <div className="grid grid-cols-7 gap-1">
                {[0, 1, 2, 3, 4, 5, 6].map(i => {
                  const d = new Date(); d.setDate(d.getDate() + i);
                  const isToday = i === 0;
                  return (
                    <div key={i} className={`flex flex-col items-center p-2 rounded-2xl ${isToday ? 'bg-green-600 text-white' : 'bg-slate-50 text-slate-400'}`}>
                      <span className="text-[8px] font-black uppercase mb-1">{d.toLocaleDateString('es-ES', { weekday: 'short' })}</span>
                      <span className="text-sm font-black mb-2">{d.getDate()}</span>
                      <div className="flex flex-col gap-1">
                        {getDaySchedule().map(h => (
                          <div key={h} className={`w-1.5 h-1.5 rounded-full ${isToday ? 'bg-white' : 'bg-green-400'}`} />
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            </Card>

            <Card className="p-6 rounded-[2.5rem] bg-slate-900 text-white">
              <div className="flex justify-between items-center mb-4">
                <div className="flex items-center gap-2"><Clock className="w-5 h-5 text-green-400" /><h4 className="font-black uppercase text-xs">Hoy</h4></div>
                <Badge className="bg-green-500 font-black">{getDaySchedule().length} Tomas</Badge>
              </div>
              <div className="grid grid-cols-2 gap-2">
                {getDaySchedule().map(h => (
                  <div key={h} className="bg-white/10 p-4 rounded-2xl flex items-center justify-center font-black text-xl border border-white/5">{h}:00</div>
                ))}
              </div>
            </Card>
          </TabsContent>

          <TabsContent value="history" className="space-y-3">
            {history.map((h: any) => (
              <Card key={h.id} className="p-5 rounded-3xl bg-white border shadow-sm">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="text-[8px] font-black text-slate-300 uppercase mb-1">{h.date}</p>
                    <p className="font-black text-slate-800">pH {h.pH} | EC {h.ec}</p>
                  </div>
                  <Badge variant="outline" className="text-[8px] font-black">{h.waterVol}L</Badge>
                </div>
                {(h.corr.ph || h.corr.ec) && (
                  <div className="mt-3 flex flex-wrap gap-2 border-t pt-3">
                    {h.corr.ph && <Badge className="bg-orange-100 text-orange-600 text-[8px] font-black border-none">{h.corr.ph}</Badge>}
                    {h.corr.ec && <Badge className="bg-blue-100 text-blue-600 text-[8px] font-black border-none">{h.corr.ec}</Badge>}
                  </div>
                )}
              </Card>
            ))}
          </TabsContent>

          <TabsContent value="settings" className="py-10">
             <button onClick={() => {localStorage.clear(); window.location.reload();}} className="w-full bg-red-100 text-red-600 p-8 rounded-[2.5rem] font-black uppercase text-xs border-2 border-red-200">Reset Total</button>
          </TabsContent>
        </Tabs>
      </main>

      {showPlantSelector && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[999] flex items-end p-4">
          <div className="bg-white w-full max-w-md mx-auto rounded-[3rem] p-8">
            <div className="grid grid-cols-1 gap-2">
              {Object.keys(VARIETY_CONFIG).map(v => (
                <button key={v} onClick={() => { setPlants([...plants, {id: Date.now(), variety: v, level: showPlantSelector.lvl, position: showPlantSelector.pos}]); setShowPlantSelector(null); }} 
                  className={`w-full p-5 rounded-2xl font-black text-left flex justify-between items-center ${VARIETY_CONFIG[v].bg} text-white`}>{v} <Plus /></button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
