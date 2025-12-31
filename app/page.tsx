"use client"

import React, { useState, useEffect } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { 
  Sprout, Activity, Layers, Beaker, Calendar as CalendarIcon, 
  History, Plus, Trash2, FlaskConical, 
  ArrowDownCircle, RefreshCw, Clock, Droplets, AlertCircle
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
  const [setupStep, setSetupStep] = useState(1);
  const [activeTab, setActiveTab] = useState("overview");
  const [plants, setPlants] = useState<any[]>([]);
  const [history, setHistory] = useState<any[]>([]);
  const [lastRotation, setLastRotation] = useState<string>(new Date().toISOString());
  const [showPlantSelector, setShowPlantSelector] = useState<{lvl: number, pos: number} | null>(null);
  const [initialVol, setInitialVol] = useState("20");
  const [params, setParams] = useState({ pH: "6.0", ec: "1.2", waterVol: "20" });

  useEffect(() => {
    const saved = localStorage.getItem("hydroCaru_Final_V23");
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
      localStorage.setItem("hydroCaru_Final_V23", JSON.stringify({ isSetupComplete, plants, params, initialVol, history, lastRotation }));
    }
  }, [isSetupComplete, plants, params, initialVol, history, lastRotation]);

  // --- LÓGICA DE ALERTAS (SISTEMA DE CÁLCULO REALTIEM) ---
  const phVal = parseFloat(params.pH) || 0;
  const ecVal = parseFloat(params.ec) || 0;
  const currentVol = parseFloat(params.waterVol) || 0;
  const limitVol = parseFloat(initialVol) || 20;
  
  // Objetivo EC según cantidad de plantas
  const targetEC = plants.length > 12 ? 1.6 : plants.length > 6 ? 1.4 : 1.2;

  // 1. Alerta pH (Margen 5.8 - 6.2)
  const phDownNeeded = phVal > 6.2;
  const phUpNeeded = phVal < 5.8 && phVal > 0;
  const phCorrMl = phDownNeeded ? (phVal - 6.0) * currentVol * 0.1 : (6.0 - phVal) * currentVol * 0.1;

  // 2. Alerta EC (Baja -> Nutrientes | Alta -> Agua)
  const ecLow = ecVal < targetEC && ecVal > 0;
  const ecHigh = ecVal > (targetEC + 0.1);
  const nutrientMl = (targetEC - ecVal) / 0.1 * currentVol * 0.25;
  const waterLitersToDilute = (currentVol * (ecVal - targetEC)) / targetEC;

  // 3. Alerta Volumen Bajo
  const isWaterLow = currentVol < (limitVol * 0.5);

  // 4. Rotación
  const needsRot = (new Date().getTime() - new Date(lastRotation).getTime()) / (1000 * 60 * 60 * 24) >= 14;

  const handlePlantAction = (lvl: number, pos: number) => {
    const exists = plants.find(p => p.level === lvl && p.position === pos);
    if (exists) setPlants(plants.filter(p => p.id !== exists.id));
    else setShowPlantSelector({ lvl, pos });
  };

  const renderLevelUI = (lvl: number) => (
    <div key={lvl} className="bg-white p-4 rounded-3xl border mb-4 shadow-sm">
      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 text-center">Nivel {lvl}</p>
      <div className="grid grid-cols-3 gap-3">
        {[1, 2, 3, 4, 5, 6].map(pos => {
          const p = plants.find(x => x.level === lvl && x.position === pos);
          return (
            <button key={pos} onClick={() => handlePlantAction(lvl, pos)} className={`aspect-square rounded-2xl flex flex-col items-center justify-center border-2 ${p ? `${VARIETY_CONFIG[p.variety]?.bg} border-white text-white shadow-md` : 'bg-slate-50 border-dashed border-slate-200 text-slate-300'}`}>
              {p ? <Sprout className="w-6 h-6" /> : <Plus className="w-5 h-5" />}
              {p && <span className="text-[6px] font-black uppercase mt-1 leading-none">{p.variety.split(' ')[0]}</span>}
            </button>
          );
        })}
      </div>
    </div>
  );

  if (!isSetupComplete) {
    return (
      <div className="min-h-screen bg-slate-100 flex items-center justify-center p-4">
        <Card className="w-full max-w-md p-8 bg-white rounded-[3rem] shadow-2xl">
          <h2 className="text-3xl font-black italic text-green-600 tracking-tighter text-center mb-8">HydroCaru</h2>
          {setupStep === 1 ? (
            <div className="space-y-6">
              <div className="bg-slate-50 p-6 rounded-[2rem] border-2 font-black">
                <span className="text-[10px] text-slate-400 uppercase">Capacidad Tanque (L)</span>
                <input type="number" value={initialVol} onChange={e => {setInitialVol(e.target.value); setParams({...params, waterVol: e.target.value})}} className="w-full bg-transparent text-4xl outline-none mt-2" />
              </div>
              <button onClick={() => setSetupStep(2)} className="w-full bg-slate-900 text-white p-6 rounded-[2rem] font-black uppercase tracking-widest">Siguiente</button>
            </div>
          ) : (
            <div className="space-y-6">
              <p className="text-center text-slate-400 font-bold uppercase text-[10px] tracking-widest">Rellena el Nivel 1 (Superior)</p>
              {renderLevelUI(1)}
              <button disabled={plants.filter(p => p.level === 1).length < 6} onClick={() => setIsSetupComplete(true)} className="w-full bg-green-600 text-white p-6 rounded-[2rem] font-black shadow-xl disabled:opacity-20 transition-all uppercase">Iniciar Cultivo</button>
            </div>
          )}
        </Card>
        {showPlantSelector && (
          <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[999] flex items-end p-4">
            <div className="bg-white w-full max-w-md mx-auto rounded-[3rem] p-8 animate-in slide-in-from-bottom">
              <div className="grid grid-cols-1 gap-2">
                {Object.keys(VARIETY_CONFIG).map(v => (
                  <button key={v} onClick={() => { setPlants([...plants, {id: Date.now(), variety: v, level: showPlantSelector.lvl, position: showPlantSelector.pos}]); setShowPlantSelector(null); }} className={`w-full p-5 rounded-2xl font-black text-left flex justify-between items-center ${VARIETY_CONFIG[v].bg} text-white`}>{v} <Plus /></button>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 pb-32 font-sans">
      <header className="bg-white border-b p-6 sticky top-0 z-50 flex justify-between items-center shadow-sm">
        <div className="font-black text-green-600 text-2xl italic tracking-tighter">HydroCaru</div>
        <Badge className="bg-slate-900 text-white rounded-full px-4 h-8 flex items-center font-black">{params.waterVol}L / {initialVol}L</Badge>
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
            {/* ALERTAS DINÁMICAS */}
            <div className="space-y-3">
              {phDownNeeded && (
                <Card className="bg-purple-600 text-white p-6 rounded-[2.5rem] flex items-center gap-6 shadow-lg border-none">
                  <ArrowDownCircle className="w-10 h-10 shrink-0" />
                  <div><p className="text-[10px] font-black uppercase opacity-70">Ajuste pH</p><p className="text-3xl font-black">{phCorrMl.toFixed(1)} ml</p><p className="text-[10px] font-bold uppercase">Añadir pH DOWN</p></div>
                </Card>
              )}
              {phUpNeeded && (
                <Card className="bg-orange-500 text-white p-6 rounded-[2.5rem] flex items-center gap-6 shadow-lg border-none">
                  <ArrowDownCircle className="w-10 h-10 shrink-0 rotate-180" />
                  <div><p className="text-[10px] font-black uppercase opacity-70">Ajuste pH</p><p className="text-3xl font-black">{phCorrMl.toFixed(1)} ml</p><p className="text-[10px] font-bold uppercase">Añadir pH UP</p></div>
                </Card>
              )}
              {ecLow && (
                <Card className="bg-blue-600 text-white p-6 rounded-[2.5rem] flex items-center gap-6 shadow-lg border-none">
                  <FlaskConical className="w-10 h-10 shrink-0" />
                  <div><p className="text-[10px] font-black uppercase opacity-70">EC Baja</p><p className="text-3xl font-black">{nutrientMl.toFixed(1)} ml</p><p className="text-[10px] font-bold uppercase">Añadir Nutrientes A+B</p></div>
                </Card>
              )}
              {ecHigh && (
                <Card className="bg-cyan-500 text-white p-6 rounded-[2.5rem] flex items-center gap-6 shadow-lg border-none">
                  <Droplets className="w-10 h-10 shrink-0 animate-pulse" />
                  <div><p className="text-[10px] font-black uppercase opacity-70">EC Alta</p><p className="text-3xl font-black">{waterLitersToDilute.toFixed(1)} L</p><p className="text-[10px] font-bold uppercase">Añadir Agua Limpia</p></div>
                </Card>
              )}
              {isWaterLow && (
                <Card className="bg-amber-500 text-white p-6 rounded-[2.5rem] flex items-center gap-6 shadow-lg border-none">
                  <AlertCircle className="w-10 h-10 shrink-0" />
                  <div><p className="text-[10px] font-black uppercase opacity-70">Depósito</p><p className="text-2xl font-black uppercase">Rellenar Agua</p></div>
                </Card>
              )}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <Card className="bg-white p-8 rounded-[2.5rem] border text-center">
                <p className="text-[10px] font-black text-slate-300 uppercase mb-1">pH</p>
                <p className={`text-5xl font-black ${phDownNeeded || phUpNeeded ? 'text-red-500' : 'text-slate-800'}`}>{params.pH}</p>
              </Card>
              <Card className="bg-white p-8 rounded-[2.5rem] border text-center">
                <p className="text-[10px] font-black text-slate-300 uppercase mb-1">EC</p>
                <p className={`text-5xl font-black ${ecHigh || ecLow ? 'text-blue-500' : 'text-slate-800'}`}>{params.ec}</p>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="measure">
            <Card className="p-8 rounded-[3rem] space-y-6 shadow-2xl border-none">
              <h2 className="text-center font-black text-2xl italic uppercase tracking-tighter">Nueva Toma</h2>
              <div className="space-y-4">
                <div className="bg-slate-50 p-4 rounded-3xl border-2 font-black text-center"><label className="text-[10px] text-slate-400 uppercase block mb-1">pH</label><input type="number" step="0.1" value={params.pH} onChange={e => setParams({...params, pH: e.target.value})} className="w-full bg-transparent text-4xl outline-none text-center" /></div>
                <div className="bg-slate-50 p-4 rounded-3xl border-2 font-black text-center"><label className="text-[10px] text-slate-400 uppercase block mb-1">EC</label><input type="number" step="0.1" value={params.ec} onChange={e => setParams({...params, ec: e.target.value})} className="w-full bg-transparent text-4xl outline-none text-center" /></div>
                <div className="bg-blue-50 p-4 rounded-3xl border-2 border-blue-100 font-black text-center"><label className="text-[10px] text-blue-400 uppercase block mb-1">Litros Actuales</label><input type="number" value={params.waterVol} onChange={e => setParams({...params, waterVol: e.target.value})} className="w-full bg-transparent text-4xl outline-none text-center text-blue-600" /></div>
                <button onClick={() => {
                  const corrLog = {
                    ph: phDownNeeded ? `-${phCorrMl.toFixed(1)}ml Down` : phUpNeeded ? `+${phCorrMl.toFixed(1)}ml Up` : null,
                    ec: ecLow ? `+${nutrientMl.toFixed(1)}ml Nutri` : ecHigh ? `+${waterLitersToDilute.toFixed(1)}L Agua` : null
                  };
                  setHistory([{...params, id: Date.now(), date: new Date().toLocaleString(), corr: corrLog}, ...history]);
                  setActiveTab("overview");
                }} className="w-full bg-slate-900 text-white p-7 rounded-[2.5rem] font-black uppercase tracking-widest">Guardar y Ver Plan</button>
              </div>
            </Card>
          </TabsContent>

          <TabsContent value="tower" className="space-y-2">
            {[1, 2, 3].map(lvl => renderLevelUI(lvl))}
          </TabsContent>

          <TabsContent value="calendar" className="space-y-6">
            <Card className="p-6 rounded-[2.5rem] bg-white border shadow-sm">
              <h3 className="font-black uppercase text-[10px] text-slate-400 mb-6 text-center tracking-widest">Plan Semanal</h3>
              <div className="grid grid-cols-7 gap-1">
                {[0, 1, 2, 3, 4, 5, 6].map(i => {
                  const d = new Date(); d.setDate(d.getDate() + i);
                  const isToday = i === 0;
                  return (
                    <div key={i} className={`flex flex-col items-center p-2 rounded-2xl ${isToday ? 'bg-green-600 text-white shadow-md' : 'bg-slate-50 text-slate-400'}`}>
                      <span className="text-[8px] font-black uppercase mb-1">{d.toLocaleDateString('es-ES', { weekday: 'short' })}</span>
                      <span className="text-sm font-black mb-2">{d.getDate()}</span>
                      <div className="flex flex-col gap-1">
                        {[1, 2].map(dot => <div key={dot} className={`w-1.5 h-1.5 rounded-full ${isToday ? 'bg-white' : 'bg-green-400'}`} />)}
                      </div>
                    </div>
                  );
                })}
              </div>
            </Card>
          </TabsContent>

          <TabsContent value="history" className="space-y-3">
            {history.map((h: any) => (
              <Card key={h.id} className="p-5 rounded-3xl bg-white border shadow-sm">
                <div className="flex justify-between items-start">
                  <div><p className="text-[8px] font-black text-slate-300 mb-1">{h.date}</p><p className="font-black text-slate-800">pH {h.pH} | EC {h.ec}</p></div>
                  <Badge variant="outline" className="text-[8px] font-black">{h.waterVol}L</Badge>
                </div>
                {(h.corr?.ph || h.corr?.ec) && (
                  <div className="mt-3 flex flex-wrap gap-2 border-t pt-2">
                    {h.corr.ph && <Badge className="bg-orange-100 text-orange-600 border-none text-[8px] font-black">{h.corr.ph}</Badge>}
                    {h.corr.ec && <Badge className="
