"use client"

import React, { useState, useEffect } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { 
  Sprout, Activity, Layers, Beaker, Calendar, 
  History, Plus, Trash2, FlaskConical, CheckCircle2, 
  ArrowDownCircle, ArrowUpCircle, AlertCircle, Clock
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

const VARIETIES = Object.keys(VARIETY_CONFIG);

export default function HydroponicTowerApp() {
  const [setupStep, setSetupStep] = useState(1);
  const [isSetupComplete, setIsSetupComplete] = useState(false);
  const [activeTab, setActiveTab] = useState("overview");
  const [plants, setPlants] = useState<any[]>([]);
  const [history, setHistory] = useState<any[]>([]);
  
  const [params, setParams] = useState({ 
    pH: "7.0", ec: "0.6", waterVol: "20", waterTemp: "20"
  });
  
  const [lastMeasurementDate, setLastMeasurementDate] = useState(new Date().toISOString());
  const [lastCleaning, setLastCleaning] = useState(new Date().toISOString());
  const [showPlantSelector, setShowPlantSelector] = useState<{lvl: number, pos: number} | null>(null);

  useEffect(() => {
    const saved = localStorage.getItem("hydroCaru_Logic_V7");
    if (saved) {
      try {
        const d = JSON.parse(saved);
        if (d.isSetupComplete) {
          setIsSetupComplete(true);
          setPlants(d.plants || []);
          setParams(d.params);
          setLastCleaning(d.lastCleaning);
          setHistory(d.history || []);
          setLastMeasurementDate(d.lastMeasurementDate || new Date().toISOString());
        }
      } catch (e) { console.error(e); }
    }
  }, []);

  useEffect(() => {
    if (isSetupComplete) {
      localStorage.setItem("hydroCaru_Logic_V7", JSON.stringify({ 
        isSetupComplete, plants, params, lastCleaning, history, lastMeasurementDate 
      }));
    }
  }, [isSetupComplete, plants, params, lastCleaning, history, lastMeasurementDate]);

  // --- LÓGICA DE CORRECCIÓN ---
  const nEC = parseFloat(params.ec) || 0;
  const nPH = parseFloat(params.pH) || 0;
  const nVol = parseFloat(params.waterVol) || 0;
  
  const recommendedEC = plants.length > 0 ? 1.4 : 1.2;
  const ecDiff = recommendedEC - nEC;
  const mlHyPro = ecDiff > 0.05 ? (ecDiff / 0.1) * nVol * 0.25 : 0;

  let phCorrection = { type: "", ml: 0 };
  if (nPH > 6.5) phCorrection = { type: "pH Down", ml: (nPH - 6.0) * nVol * 0.1 };
  else if (nPH < 5.5) phCorrection = { type: "pH Up", ml: (6.0 - nPH) * nVol * 0.1 };

  const hoursSinceLastMeasure = Math.floor((Date.now() - new Date(lastMeasurementDate).getTime()) / (1000 * 60 * 60));
  const needsMeasurement = hoursSinceLastMeasure >= 24;

  const saveMeasurement = () => {
    const now = new Date();
    setLastMeasurementDate(now.toISOString());
    setHistory([{ ...params, date: now.toLocaleString(), id: Date.now() }, ...history]);
    setActiveTab("overview");
  };

  // --- INTERFAZ DE CONFIGURACIÓN INICIAL (WIZARD) ---
  if (!isSetupComplete) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4 font-sans">
        <Card className="w-full max-w-md p-8 bg-white rounded-[3rem] shadow-2xl">
          <div className="flex justify-between mb-8">
            {[1, 2, 3, 4].map(s => (
              <div key={s} className={`h-2 flex-1 mx-1 rounded-full ${setupStep >= s ? 'bg-green-500' : 'bg-slate-100'}`} />
            ))}
          </div>

          {setupStep === 1 && (
            <div className="space-y-6 animate-in fade-in slide-in-from-right">
              <div className="bg-green-50 w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Droplets className="text-green-600 w-8 h-8" />
              </div>
              <h2 className="text-2xl font-black text-center tracking-tight">1. Volumen del Depósito</h2>
              <p className="text-center text-slate-400 text-sm">¿Cuántos litros has puesto en la torre?</p>
              <input type="text" inputMode="decimal" value={params.waterVol} onChange={e => setParams({...params, waterVol: e.target.value})} className="w-full p-6 bg-slate-50 border-2 rounded-[2rem] font-black text-4xl text-center outline-none focus:border-green-500" />
              <button onClick={() => setSetupStep(2)} className="w-full bg-slate-900 text-white p-6 rounded-[2rem] font-black">SIGUIENTE</button>
            </div>
          )}

          {setupStep === 2 && (
            <div className="space-y-6 animate-in fade-in slide-in-from-right">
              <div className="bg-blue-50 w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Beaker className="text-blue-600 w-8 h-8" />
              </div>
              <h2 className="text-2xl font-black text-center tracking-tight">2. Control Inicial</h2>
              <p className="text-center text-slate-400 text-sm">Mide el agua de tu grifo antes de añadir nada.</p>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1 text-center">
                  <span className="text-[10px] font-black uppercase text-slate-400">pH Inicial</span>
                  <input type="text" value={params.pH} onChange={e => setParams({...params, pH: e.target.value})} className="w-full p-5 bg-slate-50 border-2 rounded-2xl font-black text-2xl text-center" />
                </div>
                <div className="space-y-1 text-center">
                  <span className="text-[10px] font-black uppercase text-slate-400">EC Inicial</span>
                  <input type="text" value={params.ec} onChange={e => setParams({...params, ec: e.target.value})} className="w-full p-5 bg-slate-50 border-2 rounded-2xl font-black text-2xl text-center" />
                </div>
              </div>
              <button onClick={() => setSetupStep(3)} className="w-full bg-slate-900 text-white p-6 rounded-[2rem] font-black">SIGUIENTE</button>
            </div>
          )}

          {setupStep === 3 && (
            <div className="space-y-6 animate-in fade-in slide-in-from-right">
              <div className="bg-purple-50 w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Sprout className="text-purple-600 w-8 h-8" />
              </div>
              <h2 className="text-2xl font-black text-center tracking-tight">3. Añadir Plántulas</h2>
              <p className="text-center text-slate-400 text-sm">Registra tus primeras 6 plantas.</p>
              <div className="grid grid-cols-3 gap-3">
                {[1,2,3,4,5,6].map(i => (
                  <div key={i} className="aspect-square bg-slate-50 rounded-2xl border-2 border-dashed flex items-center justify-center text-slate-300">
                    <CheckCircle2 className={i <= plants.length ? "text-green-500" : ""} />
                  </div>
                ))}
              </div>
              <select onChange={(e) => { if(plants.length < 6) setPlants([...plants, {id: Date.now(), variety: e.target.value, level: 1, position: plants.length+1}]) }} className="w-full p-4 bg-slate-100 rounded-2xl font-bold">
                <option value="">Seleccionar Variedad ({plants.length}/6)</option>
                {VARIETIES.map(v => <option key={v} value={v}>{v}</option>)}
              </select>
              <button disabled={plants.length < 6} onClick={() => setSetupStep(4)} className="w-full bg-slate-900 text-white p-6 rounded-[2rem] font-black disabled:opacity-30">SIGUIENTE</button>
            </div>
          )}

          {setupStep === 4 && (
            <div className="space-y-6 animate-in zoom-in">
              <h2 className="text-3xl font-black text-center">¡Listo!</h2>
              <div className="p-6 bg-green-50 rounded-[2rem] border-2 border-green-100 text-green-800 text-center font-bold">
                Tu torre está configurada para {params.waterVol}L con sus primeras 6 plantas.
              </div>
              <button onClick={() => setIsSetupComplete(true)} className="w-full bg-green-600 text-white p-8 rounded-[2.5rem] font-black shadow-xl">ENTRAR AL PANEL</button>
            </div>
          )}
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 pb-36 font-sans">
      <header className="bg-white border-b p-5 sticky top-0 z-50 flex justify-between items-center shadow-sm">
        <div className="flex items-center gap-2 font-black text
