"use client"

import React, { useState, useEffect } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { 
  Sprout, Activity, Layers, Beaker, Calendar, 
  History, Plus, Trash2, FlaskConical, CheckCircle2, 
  ArrowDownCircle, ArrowUpCircle, AlertTriangle, Clock, Droplets
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
  
  // Usamos strings para que los decimales funcionen sin saltos
  const [params, setParams] = useState({ 
    pH: "6.0", ec: "1.2", waterVol: "20", waterTemp: "20"
  });
  
  const [lastCleaning, setLastCleaning] = useState(new Date().toISOString());
  const [showPlantSelector, setShowPlantSelector] = useState<{lvl: number, pos: number} | null>(null);

  useEffect(() => {
    const saved = localStorage.getItem("hydroCaru_Final_Garantizado");
    if (saved) {
      try {
        const d = JSON.parse(saved);
        if (d.isSetupComplete) {
          setIsSetupComplete(true);
          setPlants(d.plants || []);
          setParams(d.params);
          setHistory(d.history || []);
        }
      } catch (e) { console.error("Error cargando datos", e); }
    }
  }, []);

  useEffect(() => {
    if (isSetupComplete) {
      localStorage.setItem("hydroCaru_Final_Garantizado", JSON.stringify({ isSetupComplete, plants, params, history }));
    }
  }, [isSetupComplete, plants, params, history]);

  // --- LÓGICA DE CÁLCULO (Sencilla y Robusta) ---
  const nPH = parseFloat(params.pH) || 0;
  const nEC = parseFloat(params.ec) || 0;
  const nVol = parseFloat(params.waterVol) || 20;

  // Lógica de Nutrientes (Hy-Pro) - Objetivo 1.4 si hay plantas
  const targetEC = plants.length > 0 ? 1.4 : 1.2;
  const needsEC = targetEC - nEC;
  const mlHyPro = needsEC > 0 ? (needsEC / 0.1) * nVol * 0.25 : 0;

  // Lógica de pH (Rango ideal 5.8 - 6.2)
  let phAction = { type: "", ml: 0, color: "" };
  if (nPH > 6.5) phAction = { type: "pH DOWN (Ácido)", ml: (nPH - 6.0) * nVol * 0.1, color: "purple" };
  if (nPH < 5.5) phAction = { type: "pH UP (Base)", ml: (6.0 - nPH) * nVol * 0.1, color: "orange" };

  const saveMeasurement = () => {
    setHistory([{ ...params, date: new Date().toLocaleString(), id: Date.now() }, ...history]);
    setActiveTab("overview");
  };

  if (!isSetupComplete) {
    return (
      <div className="min-h-screen bg-slate-100 flex items-center justify-center p-4">
        <Card className="w-full max-w-md p-8 bg-white rounded-[2.5rem] shadow-2xl space-y-6">
          <h2 className="text-3xl font-black text-center text-slate-800 italic">HydroCaru</h2>
          {setupStep === 1 ? (
            <div className="space-y-4">
              <p className="text-center font-bold text-slate-500">Paso 1: Configura el Agua</p>
              <div className="space-y-2">
                <label className="text-[10px] font-bold uppercase ml-2">Litros en Depósito</label>
                <input type="text" value={params.waterVol} onChange={e => setParams({...params, waterVol: e.target.value})} className="w-full p-5 bg-slate-50 border-2 rounded-2xl text-center text-2xl font-black" />
              </div>
              <button onClick={() => setSetupStep(2)} className="w-full bg-slate-900 text-white p-5 rounded-2xl font-black">CONTINUAR</button>
            </div>
          ) : (
            <div className="space-y-4">
              <p className="text-center font-bold text-slate-500">Paso 2: Añade las 6 primeras plantas</p>
              <div className="grid grid-cols-3 gap-2">
                {[1,2,3,4,5,6].map(i => (
                  <div key={i} className={`aspect-square rounded-xl border-2 flex items-center justify-center ${plants.length >= i ? 'bg-green-500 border-green-600 text-white' : 'bg-slate-50 border-dashed border-slate-200 text-slate-300'}`}>
                    <Sprout />
                  </div>
                ))}
              </div>
              <select onChange={(e) => setPlants([...plants, {id: Date.now(), variety: e.target.value, level: 1, position: plants.length+1}])} className="w-full p-4 bg-slate-100 rounded-xl font-bold">
                <option>Seleccionar Variedad...</option>
                {Object.keys(VARIETY_CONFIG).map(v => <option key={v} value={v}>{v}</option>)}
              </select>
              <button disabled={plants.length < 6} onClick={() => setIsSetupComplete(true)} className="w-full bg-green-600 text-white p-5 rounded-2xl font-black disabled:opacity-30">INICIAR PANEL PRO</button>
            </div>
          )}
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 pb-32">
      <header className="bg-white border-b p-5 sticky top-0 z-50 flex justify-between items-center shadow-sm">
        <div className="flex items-center gap-2 font-black text-green-600 text-2xl italic tracking-tighter"><Sprout /> HydroCaru</div>
        <Badge className="bg-green-600 text-white rounded-full px-4">{params.waterVol}L</Badge>
      </header>

      <main className="container mx-auto p-4 max-w-md">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid grid-cols-6 h-16 bg-white border shadow-xl rounded-2xl p-1 mb-8">
            <TabsTrigger value="overview"><Activity className="w-5 h-5" /></TabsTrigger>
            <TabsTrigger value="measure"><Beaker className="w-5 h-5" /></TabsTrigger>
            <TabsTrigger value="tower"><Layers className="w-5 h-5" /></TabsTrigger>
            <TabsTrigger value="calendar"><Calendar className="w-5 h-5" /></TabsTrigger>
            <TabsTrigger value="history"><History className="w-5 h-5" /></TabsTrigger>
            <TabsTrigger value="
