"use client"

import React, { useState, useEffect } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { 
  Sprout, Activity, Layers, Beaker, Calendar, 
  History, Plus, Trash2, FlaskConical, 
  ArrowDownCircle, ArrowUpCircle, AlertTriangle, RefreshCw, Check, Clock
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
  const [params, setParams] = useState({ pH: "6.0", ec: "1.2", waterVol: "20" });

  useEffect(() => {
    const saved = localStorage.getItem("hydroCaru_Final_V16");
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
      localStorage.setItem("hydroCaru_Final_V16", JSON.stringify({ isSetupComplete, plants, params, history, lastRotation }));
    }
  }, [isSetupComplete, plants, params, history, lastRotation]);

  const checkRotationNeeded = () => {
    const last = new Date(lastRotation).getTime();
    return (new Date().getTime() - last) / (1000 * 60 * 60 * 24) >= 14;
  };

  const executeRotation = () => {
    let newPlants = plants.filter(p => p.level !== 3).map(p => ({ ...p, level: p.level + 1 }));
    setPlants(newPlants);
    setLastRotation(new Date().toISOString());
    setActiveTab("tower");
  };

  const currentPH = parseFloat(params.pH) || 0;
  const currentEC = parseFloat(params.ec) || 0;
  const vol = parseFloat(params.waterVol) || 0;
  
  // Lógica de pH
  let phCorrection = { needed: false, type: "", ml: 0, color: "" };
  if (currentPH > 6.2) {
    phCorrection = { needed: true, type: "pH DOWN (Ácido)", ml: (currentPH - 6.0) * vol * 0.1, color: "bg-purple-600" };
  } else if (currentPH < 5.8 && currentPH > 0) {
    phCorrection = { needed: true, type: "pH UP (Base)", ml: (6.0 - currentPH) * vol * 0.1, color: "bg-orange-500" };
  }

  // EC y Horarios recomendados
  const targetEC = plants.length > 12 ? 1.6 : plants.length > 6 ? 1.4 : 1.2;
  const mlNutrientes = (targetEC - currentEC) > 0 && vol > 0 ? ((targetEC - currentEC) / 0.1) * vol * 0.25 : 0;

  // RECOMENDACIÓN DE TOMAS SEGÚN CARGA
  const getRecommendedTasks = () => {
    const pCount = plants.length;
    const ratio = pCount / (vol || 1);
    if (ratio > 0.8) return ["08:00", "12:00", "16:00", "21:00"]; // Carga alta o poco agua: 4 tomas
    if (ratio > 0.4) return ["09:00", "15:00", "21:00"]; // Carga media: 3 tomas
    return ["10:00", "20:00"]; // Carga baja: 2 tomas
  };

  const handlePlantClick = (lvl: number, pos: number) => {
    const exists = plants.find(p => p.level === lvl && p.position === pos);
    if (exists) setPlants(plants.filter(p => p.id !== exists.id));
    else setShowPlantSelector({ lvl, pos });
  };

  const renderLevel = (lvl: number) => (
    <div key={lvl} className="bg-white p-4 rounded-3xl border mb-4 shadow-sm">
      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 text-center">Nivel {lvl}</p>
      <div className="grid grid-cols-3 gap-3">
        {[1, 2, 3, 4, 5, 6].map(pos => {
          const p = plants.find(x => x.level === lvl && x.position === pos);
          return (
            <button key={pos} type="button" onClick={() => handlePlantClick(lvl, pos)}
              className={`aspect-square rounded-2xl flex flex-col items-center justify-center border-2 transition-all ${p ? `${VARIETY_CONFIG[p.variety]?.bg} border-white text-white shadow-md` : 'bg-slate-50 border-dashed border-slate-200 text-slate-300'}`}>
              {p ? <Sprout className="w-6 h-6" /> : <Plus className="w-5 h-5" />}
              {p && <span className="text-[6px] font-black uppercase mt-1">{p.variety.split(' ')[0]}</span>}
            </button>
          );
        })}
      </div>
    </div>
  );

  const SelectorModal = () => showPlantSelector && (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[999] flex items-end p-4">
      <div className="bg-white w-full max-w-md mx-auto rounded-[3rem] p-8 animate-in slide-in-from-bottom">
        <h3 className="text-center font-black uppercase mb-6 text-slate-400 text-xs">Variedad</h3>
        <div className="grid grid-cols-1 gap-2">
          {Object.keys(VARIETY_CONFIG).map(v => (
            <button key={v} onClick={() => { setPlants([...plants, {id: Date.now(), variety: v, level: showPlantSelector.lvl, position: showPlantSelector.pos}]); setShowPlantSelector(null); }} 
              className={`w-full p-5 rounded-2xl font-black text-left flex
