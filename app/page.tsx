"use client"

import React, { useState, useEffect, useMemo } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { 
  Sprout, Activity, Layers, Beaker, Calendar, 
  Plus, Trash2, FlaskConical, ArrowDownCircle, Check, 
  Lock, Lightbulb, Scissors, Clock, AlertTriangle, Wind, Droplets, Thermometer, Zap, ShieldAlert, ChevronRight, Anchor, ArrowLeft, ArrowRight, Bell, CloudRain, ThermometerSun, RefreshCw, Skull, Info, Calculator
} from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Card } from "@/components/ui/card"
import HydroCalc from './components/HydroCalc'

const VARIETIES = {
  "Iceberg": { 
    color: "bg-cyan-500",
    ecMax: 1.6,
    phIdeal: 6.0,
    hyproDosage: {
      seedling: { a: 6, b: 6, ec: 0.7 },
      growth:   { a: 10, b: 10, ec: 1.1 },
      mature:   { a: 14, b: 14, ec: 1.6 }
    },
    info: "Sensible al exceso de sales."
  },
  "Lollo Rosso": { 
    color: "bg-purple-600",
    ecMax: 1.8,
    phIdeal: 6.0,
    hyproDosage: {
      seedling: { a: 8, b: 8, ec: 0.9 },
      growth:   { a: 13, b: 13, ec: 1.3 },
      mature:   { a: 17, b: 17, ec: 1.8 }
    },
    info: "Color intenso con EC alta."
  },
  "Maravilla": { 
    color: "bg-amber-600",
    ecMax: 1.7,
    phIdeal: 6.0,
    hyproDosage: {
      seedling: { a: 7, b: 7, ec: 0.8 },
      growth:   { a: 12, b: 12, ec: 1.2 },
      mature:   { a: 16, b: 16, ec: 1.7 }
    },
    info: "Clásica de alto rendimiento."
  },
  "Trocadero": { 
    color: "bg-lime-600",
    ecMax: 1.6,
    phIdeal: 6.0,
    hyproDosage: {
      seedling: { a: 6, b: 6, ec: 0.7 },
      growth:   { a: 11, b: 11, ec: 1.1 },
      mature:   { a: 15, b: 15, ec: 1.6 }
    },
    info: "Sabor suave. Cuidado en plántula."
  },
  "Hoja de Roble Rojo": { 
    color: "bg-red-600",
    ecMax: 1.9,
    phIdeal: 6.0,
    hyproDosage: {
      seedling: { a: 9, b: 9, ec: 0.9 },
      growth:   { a: 14, b: 14, ec: 1.4 },
      mature:   { a: 18, b: 18, ec: 1.9 }
    },
    info: "Crecimiento rápido, tolera EC alta."
  }
};

const calculateSystemEC = (plants, totalVolume) => {
  if (plants.length === 0) return { targetEC: "1.2", targetPH: "6.0", statistics: { seedlingCount: 0, growthCount: 0, matureCount: 0 } };
  
  let totalECWeighted = 0;
  let totalPH = 0;
  let seedlingCount = 0, growthCount = 0, matureCount = 0;
  
  plants.forEach(plant => {
    const variety = VARIETIES[plant.v];
    if (!variety) return;
    
    let stage, weight;
    if (plant.l === 1) { stage = "seedling"; weight = 0.35; seedlingCount++; }
    else if (plant.l === 2) { stage = "growth"; weight = 0.75; growthCount++; }
    else { stage = "mature"; weight = 1.0; matureCount++; }
    
    const plantEC = variety.ecMax * weight;
    totalECWeighted += plantEC;
    totalPH += variety.phIdeal;
  });
  
  let finalEC = totalECWeighted / plants.length;
  const seedlingRatio = seedlingCount / plants.length;
  if (seedlingRatio > 0.5) finalEC *= 0.85;
  
  const volumeFactor = Math.min(1.0, 30 / totalVolume);
  finalEC *= volumeFactor;
  
  finalEC = Math.max(0.6, Math.min(2.0, finalEC));
  
  return {
    targetEC: finalEC.toFixed(2),
    targetPH: (totalPH / plants.length).toFixed(1),
    statistics: { seedlingCount, growthCount, matureCount }
  };
};

const calculateHyproDosage = (plants, totalVolume, targetEC) => {
  if (plants.length === 0) return { a: 0, b: 0, per10L: { a: 0, b: 0 } };
  
  let totalA = 0, totalB = 0;
  plants.forEach(plant => {
    const variety = VARIETIES[plant.v];
    if (!variety) return;
    
    let stage;
    if (plant.l === 1) stage = "seedling";
    else if (plant.l === 2) stage = "growth";
    else stage = "mature";
    
    const dosage = variety.hyproDosage[stage];
    const plantContribution = (dosage.a / 10) * (totalVolume / plants.length);
    totalA += plantContribution;
    totalB += plantContribution;
  });
  
  const ecRatio = parseFloat(targetEC) / 1.4;
  totalA *= ecRatio;
  totalB *= ecRatio;
  
  return {
    a: Math.round(totalA),
    b: Math.round(totalB),
    per10L: {
      a: Math.round((totalA * 10) / totalVolume),
      b: Math.round((totalB * 10) / totalVolume)
    }
  };
};

const generatePlantId = () => {
  return `plant-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
};
export default function HydroAppFinalV31() {
  const [step, setStep] = useState(0);
  const [plants, setPlants] = useState([]);
  const [history, setHistory] = useState([]);
  const [lastRot, setLastRot] = useState(new Date().toISOString());
  const [lastClean, setLastClean] = useState(new Date().toISOString());
  const [config, setConfig] = useState({ 
    totalVol: "20", currentVol: "20", ph: "6.0", ec: "1.2", 
    temp: "22", targetEC: "1.4", targetPH: "6.0"
  });
  const [tab, setTab] = useState("overview");
  const [selPos, setSelPos] = useState(null);

  useEffect(() => {
    const saved = localStorage.getItem("hydro_master_v31");
    if (saved) {
      const d = JSON.parse(saved);
      setPlants(d.plants || []);
      setConfig(d.config || config);
      setHistory(d.history || []);
      setLastRot(d.lastRot);
      setLastClean(d.lastClean);
      setStep(4);
    }
  }, []);

  useEffect(() => {
    if (step >= 3) {
      localStorage.setItem("hydro_master_v31", 
        JSON.stringify({ plants, config, history, lastRot, lastClean }));
    }
  }, [plants, config, history, lastRot, lastClean, step]);

  useEffect(() => {
    if (plants.length > 0 && step >= 3) {
      const optimal = calculateSystemEC(plants, parseFloat(config.totalVol));
      const currentEC = parseFloat(config.targetEC);
      const newEC = parseFloat(optimal.targetEC);
      
      if (Math.abs(currentEC - newEC) > 0.1) {
        setConfig(prev => ({
          ...prev,
          targetEC: optimal.targetEC,
          targetPH: optimal.targetPH
        }));
      }
    }
  }, [plants, config.totalVol, step]);

  const generatePlantId = () => {
    return `plant-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  };

  const alerts = useMemo(() => {
    const vAct = parseFloat(config.currentVol) || 0;
    const vTot = parseFloat(config.totalVol) || 20;
    const ph = parseFloat(config.ph) || 6.0;
    const ec = parseFloat(config.ec) || 0;
    const tEc = parseFloat(config.targetEC) || 1.4;
    const tPh = parseFloat(config.targetPH) || 6.0;
    const temp = parseFloat(config.temp) || 20;
    const res = [];

    if (vAct < vTot * 0.3) {
      res.push({ 
        t: "¡AGUA MUY BAJA!", 
        v: `${(vTot - vAct).toFixed(1)}L`, 
        d: `Crítico: Solo queda un ${(vAct/vTot*100).toFixed(0)}%`, 
        c: "bg-gradient-to-r from-red-600 to-rose-700 animate-pulse",
        icon: <Droplets className="text-white" size={28} />,
        priority: 1
      });
    } 
    else if (vAct < vTot * 0.5) {
      res.push({ 
        t: "RELLENAR AGUA", 
        v: `${(vTot - vAct).toFixed(1)}L`, 
        d: `Depósito al ${(vAct/vTot*100).toFixed(0)}%`, 
        c: "bg-gradient-to-r from-amber-500 to-orange-500",
        icon: <CloudRain className="text-white" size={28} />,
        priority: 2
      });
    }

    if (temp > 28) {
      res.push({ 
        t: "¡PELIGRO TEMPERATURA!", 
        v: `${temp}°C`, 
        d: "Alto riesgo. Añadir hielo en botella YA.", 
        c: "bg-gradient-to-r from-red-700 to-pink-800 animate-pulse shadow-lg shadow-red-900/50",
        icon: <ThermometerSun className="text-white" size={28} />,
        priority: 1
      });
    } 
    else if (temp > 25) {
      res.push({ 
        t: "TEMPERATURA ALTA", 
        v: `${temp}°C`, 
        d: "Oxígeno bajo. Considera añadir hielo.", 
        c: "bg-gradient-to-r from-orange-500 to-red-500",
        icon: <Thermometer className="text-white" size={28} />,
        priority: 2
      });
    }
    else if (temp < 16) {
      res.push({ 
        t: "TEMPERATURA BAJA", 
        v: `${temp}°C`, 
        d: "Crecimiento muy lento. Subir temperatura.", 
        c: "bg-gradient-to-r from-cyan-600 to-blue-600",
        icon: <Thermometer className="text-white" size={28} />,
        priority: 3
      });
    }

    if (ph > tPh + 0.5 || ph < tPh - 0.5) {
      const diff = Math.abs(ph - tPh);
      const ml = (diff * 10 * vAct * 0.15).toFixed(1);
      const action = ph > tPh ? "pH-" : "pH+";
      res.push({ 
        t: `AJUSTE ${action} URGENTE`, 
        v: `${ml}ml`, 
        d: `pH ${ph} → ${tPh} (fuera de rango seguro)`, 
        c: "bg-gradient-to-r from-purple-700 to-pink-700 animate-pulse",
        icon: <RefreshCw className="text-white" size={28} />,
        priority: 1
      });
    } 
    else if (ph > tPh + 0.2 || ph < tPh - 0.2) {
      const diff = Math.abs(ph - tPh);
      const ml = (diff * 10 * vAct * 0.15).toFixed(1);
      const action = ph > tPh ? "pH-" : "pH+";
      res.push({ 
        t: `AJUSTAR ${action}`, 
        v: `${ml}ml`, 
        d: `pH ${ph} → objetivo ${tPh}`, 
        c: "bg-gradient-to-r from-purple-500 to-pink-500",
        icon: <ArrowDownCircle className={ph > tPh ? "" : "rotate-180"} size={28} />,
        priority: 2
      });
    }

    if (ec < tEc - 0.4 && ec > 0) {
      const ml = (((tEc - ec) / 0.1) * vAct * 0.25).toFixed(1);
      res.push({ 
        t: "¡FALTAN NUTRIENTES!", 
        v: `${ml}ml A+B`, 
        d: `EC ${ec} (muy baja). Las plantas sufren.`, 
        c: "bg-gradient-to-r from-blue-800 to-cyan-800 animate-pulse",
        icon: <FlaskConical className="text-white" size={28} />,
        priority: 1
      });
    } 
    else if (ec < tEc - 0.2 && ec > 0) {
      const ml = (((tEc - ec) / 0.1) * vAct * 0.25).toFixed(1);
      res.push({ 
        t: "AÑADIR NUTRIENTES", 
        v: `${ml}ml A+B`, 
        d: `Subir de ${ec} a ${tEc} mS/cm`, 
        c: "bg-gradient-to-r from-blue-600 to-cyan-600",
        icon: <FlaskConical className="text-white" size={28} />,
        priority: 2
      });
    } 
    else if (ec > tEc + 0.5) {
      const water = ((ec - tEc) / tEc * vAct).toFixed(1);
      res.push({ 
        t: "¡EC PELIGROSAMENTE ALTA!", 
        v: `${water}L AGUA`, 
        d: `EC ${ec}. Diluir URGENTE para salvar raíces.`, 
        c: "bg-gradient-to-r from-red-800 to-amber-900 animate-pulse shadow-lg shadow-amber-900/50",
        icon: <Skull className="text-white" size={28} />,
        priority: 1
      });
    } 
    else if (ec > tEc + 0.3) {
      const water = ((ec - tEc) / tEc * vAct).toFixed(1);
      res.push({ 
        t: "DILUIR CON AGUA", 
        v: `${water}L`, 
        d: `EC ${ec} > objetivo ${tEc}. Añadir agua sola.`, 
        c: "bg-gradient-to-r from-amber-600 to-orange-600",
        icon: <AlertTriangle className="text-white" size={28} />,
        priority: 2
      });
    }

    const lastCleanDate = new Date(lastClean);
    const now = new Date();
    const daysSinceClean = Math.floor((now - lastCleanDate) / (1000 * 3600 * 24));
    
    if (daysSinceClean >= 12) {
      res.push({ 
        t: daysSinceClean >= 14 ? "¡LIMPIEZA URGENTE!" : "LIMPIEZA PRÓXIMA", 
        v: `${daysSinceClean} días`, 
        d: daysSinceClean >= 14 ? "Depósito puede tener biofilm peligroso" : "Programa limpieza en los próximos días", 
        c: daysSinceClean >= 14 ? "bg-gradient-to-r from-red-700 to-rose-800 animate-pulse" : "bg-gradient-to-r from-violet-600 to-purple-700",
        icon: <ShieldAlert className="text-white" size={28} />,
        priority: daysSinceClean >= 14 ? 1 : 3
      });
    }

    return res.sort((a, b) => a.priority - b.priority);
  }, [config, lastClean]);

  const generateCalendar = () => {
    const now = new Date();
    const lastCleanDate = new Date(lastClean);
    const daysSinceClean = Math.floor((now - lastCleanDate) / (1000 * 3600 * 24));
    const daysUntilClean = Math.max(0, 14 - daysSinceClean);
    
    const totalPlants = plants.length;
    const measureFrequency = totalPlants > 12 ? 2 : totalPlants > 6 ? 3 : 4;
    
    const calendarDays = [];
    for (let i = 0; i < 15; i++) {
      const dayDate = new Date();
      dayDate.setDate(now.getDate() + i);
      const dayNumber = i + 1;
      
      let type = "normal";
      let label = "";
      let description = "";
      
      if (dayNumber % measureFrequency === 0) {
        type = "measure";
        label = "Medir";
        description = `pH, EC, Temp - ${totalPlants} plantas`;
      }
      
      if (dayNumber % 7 === 0) {
        type = "rotation";
        label = "Rotar";
        description = "Cosecha N3 → mover N2 → N1 → nuevas";
      }
      
      if (dayNumber === daysUntilClean) {
        type = "clean";
        label = "Limpiar";
        description = "Limpieza profunda del depósito";
      }
      
      if (dayNumber === daysUntilClean && dayNumber % 7 === 0) {
        type = "critical";
        label = "Doble";
        description = "Rotación + Limpieza";
      }
      
      calendarDays.push({
        day: dayNumber,
        date: dayDate,
        type,
        label,
        description
      });
    }
    
    return calendarDays;
  };

  const handleRotation = () => {
    if (confirm("¿ROTAR NIVELES?\n• Nivel 3 → Cosecha\n• Nivel 2 → Nivel 3 (maduración)\n• Nivel 1 → Nivel 2 (crecimiento)\n• Nivel 1 vacío para nuevas plántulas")) {
      const withoutMature = plants.filter(p => p.l !== 3);
      const moved = withoutMature.map(p => ({ ...p, l: p.l + 1 }));
      setPlants(moved);
      setLastRot(new Date().toISOString());
      alert("✅ Rotación completada\n\nAhora añade NUEVAS PLÁNTULAS en el nivel 1.");
      setTab("tower");
    }
  };

  if (step === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-green-50 to-blue-50 flex items-center justify-center p-6">
        <Card className="w-full max-w-xs p-10 bg-white rounded-[3rem] text-center border-b-8 border-green-600 shadow-2xl">
          <div className="mx-auto mb-6 w-20 h-20 bg-gradient-to-r from-green-400 to-blue-400 rounded-full flex items-center justify-center">
            <Droplets className="text-white" size={40} />
          </div>
          <h2 className="text-2xl font-black mb-2 uppercase text-slate-800">PASO 1: DEPÓSITO</h2>
          <p className="text-sm font-bold mb-6 text-slate-400">Capacidad TOTAL del sistema (Litros)</p>
          <input type="number" value={config.totalVol} 
            onChange={e => setConfig({...config, totalVol: e.target.value, currentVol: e.target.value})} 
            className="w-full p-6 bg-slate-50 border-4 rounded-3xl text-5xl font-black text-center text-slate-900 mb-6"
            placeholder="20"
          />
          <button onClick={() => setStep(1)} 
            className="w-full bg-gradient-to-r from-green-500 to-blue-500 text-white p-6 rounded-[2rem] font-black uppercase text-xl flex items-center justify-center gap-2 shadow-xl">
            Continuar <ArrowRight/>
          </button>
        </Card>
      </div>
    );
  }

  if (step === 1) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-emerald-50 to-lime-50 flex items-center justify-center p-4">
        <Card className="w-full max-w-md p-10 bg-white rounded-[3.5rem] shadow-2xl relative">
          <div className="flex items-center justify-between mb-8">
            <button onClick={() => setStep(0)} className="p-3 bg-slate-100 rounded-full">
              <ArrowLeft className="text-slate-500" />
            </button>
            <h2 className="text-2xl font-black text-center uppercase italic text-green-700">PASO 2: PLANTACIÓN</h2>
            <div className="w-10"></div>
          </div>
          <p className="text-center text-xs font-bold text-slate-400 mb-4">
            Selecciona las variedades en el NIVEL DE SIEMBRA (Nivel 1)
          </p>
          <div className="mb-8">
            <div className="bg-emerald-100 p-5 rounded-[2.5rem] grid grid-cols-3 gap-4 border-4 border-emerald-200 shadow-inner">
              {[1, 2, 3, 4, 5, 6].map(p => {
                const pl = plants.find(x => x.l === 1 && x.p === p);
                return (
                  <button key={p} onClick={() => pl ? setPlants(plants.filter(x => x.id !== pl.id)) : setSelPos({l: 1, p})} 
                    className={`aspect-square rounded-[1.8rem] flex flex-col items-center justify-center border-4 relative transition-all ${pl ? `${VARIETIES[pl.v].color} border-white shadow-xl scale-110` : 'bg-white border-emerald-100 hover:bg-emerald-50'}`}>
                    {pl ? <Sprout size={28} className="text-white" /> : <Plus size={24} className="text-emerald-300" />}
                    {pl && <span className="text-[7px] font-black text-white absolute bottom-1 uppercase px-1 truncate w-full text-center leading-none">{pl.v}</span>}
                  </button>
                )
              })}
            </div>
            <p className="text-center text-[10px] font-bold text-slate-400 mt-4">
              {plants.filter(p => p.l === 1).length} / 6 plantas seleccionadas
            </p>
          </div>
          <button onClick={() => plants.length > 0 ? setStep(2) : alert("Selecciona al menos una planta")} 
            className="w-full bg-gradient-to-r from-emerald-500 to-lime-500 text-white p-6 rounded-[2rem] font-black uppercase text-xl shadow-xl flex items-center justify-center gap-2">
            {plants.length > 0 ? `Ver Recomendaciones (${plants.length} plantas)` : "Selecciona Plantas"}
            <ArrowRight/>
          </button>
          {selPos && (
            <div className="fixed inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 z-[9999]">
              <div className="bg-white w-full max-w-md mx-auto rounded-[2.5rem] p-8 space-y-4 shadow-2xl">
                <div className="flex justify-between items-center mb-6">
                  <h3 className="font-black text-xl text-slate-800">Seleccionar Variedad</h3>
                  <button onClick={() => setSelPos(null)} className="p-2 bg-slate-100 rounded-full text-slate-400 hover:bg-slate-200">
                    <Plus size={24} className="rotate-45"/>
                  </button>
                </div>
                <div className="grid gap-3">
                  {Object.keys(VARIETIES).map(v => (
                    <button 
                      key={v}
                      onClick={() => {
                        const newPlant = {
                          id: generatePlantId(),
                          v: v,
                          l: selPos.l,
                          p: selPos.p
                        };
                        setPlants([...plants, newPlant]);
                        setSelPos(null);
                      }} 
                      className={`w-full p-5 rounded-[1.5rem] font-black text-white shadow-md flex justify-between items-center hover:scale-[1.02] active:scale-95 transition-all ${VARIETIES[v].color}`}
                    >
                      <div className="text-left">
                        <span className="text-xl uppercase italic tracking-tighter leading-none block">{v}</span>
                        <span className="text-[10px] opacity-80 lowercase font-medium">
                          EC máx: {VARIETIES[v].ecMax} | pH: {VARIETIES[v].phIdeal}
                        </span>
                      </div>
                      <Zap size={20}/>
                    </button>
                  ))}
                </div>
                <button 
                  onClick={() => setSelPos(null)}
                  className="w-full mt-4 p-4 bg-slate-100 rounded-[1.5rem] font-black text-slate-600 hover:bg-slate-200"
                >
                  Cancelar
                </button>
              </div>
            </div>
          )}
        </Card>
      </div>
    );
  }

  if (step === 2) {
    const optimalEC = calculateSystemEC(plants, parseFloat(config.totalVol));
    const dosage = calculateHyproDosage(plants, parseFloat(config.totalVol), optimalEC.targetEC);
    
    return (
      <div className="min-h-screen bg-gradient-to-b from-blue-50 to-teal-50 flex items-center justify-center p-4">
        <Card className="w-full max-w-md p-10 bg-white rounded-[3.5rem] shadow-2xl">
          <div className="flex items-center justify-between mb-8">
            <button onClick={() => setStep(1)} className="p-3 bg-slate-100 rounded-full">
              <ArrowLeft className="text-slate-500" />
            </button>
            <h2 className="text-2xl font-black text-center uppercase italic text-teal-700">DOSIS PRECISAS</h2>
            <div className="w-10"></div>
          </div>
          
          <div className="space-y-6 mb-10">
            <Card className="p-6 rounded-[2.5rem] bg-gradient-to-r from-slate-50 to-blue-50 border-2">
              <div className="grid grid-cols-3 gap-4 text-center">
                <div className="p-3 bg-blue-100 rounded-2xl"><p className="text-[10px] font-black text-blue-700 uppercase">Plántulas</p><p className="text-2xl font-black">{optimalEC.statistics.seedlingCount}</p></div>
                <div className="p-3 bg-purple-100 rounded-2xl"><p className="text-[10px] font-black text-purple-700 uppercase">Crecimiento</p><p className="text-2xl font-black">{optimalEC.statistics.growthCount}</p></div>
                <div className="p-3 bg-green-100 rounded-2xl"><p className="text-[10px] font-black text-green-700 uppercase">Maduras</p><p className="text-2xl font-black">{optimalEC.statistics.matureCount}</p></div>
              </div>
            </Card>
            
            <Card className="p-6 rounded-[2.5rem] bg-gradient-to-r from-blue-50 to-cyan-50 border-2 border-blue-100">
              <div className="flex justify-between items-center">
                <div><p className="text-[10px] font-black uppercase text-slate-400 mb-1">EC ÓPTIMA CALCULADA</p>
                <p className="text-4xl font-black italic text-blue-700 leading-none">{optimalEC.targetEC} mS/cm</p>
                <p className="text-[9px] font-bold mt-1 text-slate-500">Para {optimalEC.statistics.seedlingCount+optimalEC.statistics.growthCount+optimalEC.statistics.matureCount} plantas en {config.totalVol}L</p></div>
                <Activity className="text-blue-500" size={40} />
              </div>
            </Card>
            
            <Card className="p-8 rounded-[2.5rem] bg-gradient-to-r from-emerald-50 to-green-50 border-2 border-emerald-100 shadow-lg">
              <div className="text-center mb-6"><div className="inline-flex items-center gap-2 bg-emerald-100 px-4 py-2 rounded-full">
                <FlaskConical className="text-emerald-600" size={16} />
                <p className="text-xs font-black text-emerald-700 uppercase">HY-PRO A/B</p></div>
                <p className="text-[10px] font-black text-slate-400 mt-2">Dosificación para {config.totalVol}L</p>
              </div>
              <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="text-center p-4 bg-white rounded-[1.5rem] border-2 border-emerald-200">
                  <p className="text-[10px] font-black uppercase text-emerald-600 mb-1">Nutriente A</p>
                  <p className="text-3xl font-black text-emerald-700">{dosage.a} ml</p>
                  <p className="text-[8px] text-slate-500 mt-1">({dosage.per10L.a} ml/10L)</p>
                </div>
                <div className="text-center p-4 bg-white rounded-[1.5rem] border-2 border-blue-200">
                  <p className="text-[10px] font-black uppercase text-blue-600 mb-1">Nutriente B</p>
                  <p className="text-3xl font-black text-blue-700">{dosage.b} ml</p>
                  <p className="text-[8px] text-slate-500 mt-1">({dosage.per10L.b} ml/10L)</p>
                </div>
              </div>
            </Card>
          </div>
          
          <button onClick={() => {
            setConfig(prev => ({ ...prev, targetEC: optimalEC.targetEC, targetPH: optimalEC.targetPH }));
            setStep(3);
          }} className="w-full bg-gradient-to-r from-teal-500 to-emerald-500 text-white p-6 rounded-[2rem] font-black uppercase text-xl shadow-xl">
            CONFIRMAR DOSIS E INICIAR
          </button>
        </Card>
      </div>
    );
  }

  if (step === 3) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-amber-50 to-orange-50 flex items-center justify-center p-4">
        <Card className="w-full max-w-md p-10 bg-white rounded-[3.5rem] shadow-2xl">
          <div className="flex items-center justify-between mb-8">
            <button onClick={() => setStep(2)} className="p-3 bg-slate-100 rounded-full">
              <ArrowLeft className="text-slate-500" />
            </button>
            <h2 className="text-2xl font-black text-center uppercase italic text-orange-700">PASO 4: PRIMERA MEDICIÓN</h2>
            <div className="w-10"></div>
          </div>
          
          <p className="text-center text-sm font-bold text-slate-400 mb-8">Introduce los valores actuales de tu sistema</p>
          
          <Card className="p-8 rounded-[3rem] bg-white shadow-2xl border-2 space-y-6 mb-8">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1"><label className="text-[9px] font-black uppercase text-slate-400 ml-4">pH Medido</label>
                <input type="number" step="0.1" value={config.ph} onChange={e => setConfig({...config, ph: e.target.value})} 
                  className="w-full p-5 bg-slate-50 border-4 rounded-3xl text-center text-3xl font-black" placeholder="6.0"/>
              </div>
              <div className="space-y-1"><label className="text-[9px] font-black uppercase text-slate-400 ml-4">EC Medida</label>
                <input type="number" step="0.1" value={config.ec} onChange={e => setConfig({...config, ec: e.target.value})} 
                  className="w-full p-5 bg-slate-50 border-4 rounded-3xl text-center text-3xl font-black" placeholder="1.2"/>
              </div>
              <div className="space-y-1 col-span-2"><label className="text-[9px] font-black uppercase text-cyan-600 ml-4">Litros actuales en depósito</label>
                <input type="number" value={config.currentVol} onChange={e => setConfig({...config, currentVol: e.target.value})} 
                  className="w-full p-5 bg-cyan-50 border-4 border-cyan-100 rounded-3xl text-center text-4xl font-black text-cyan-800" placeholder={config.totalVol}/>
              </div>
              <div className="space-y-1 col-span-2"><label className="text-[9px] font-black uppercase text-orange-600 ml-4">Temperatura Agua °C</label>
                <input type="number" value={config.temp} onChange={e => setConfig({...config, temp: e.target.value})} 
                  className="w-full p-5 bg-orange-50 border-4 border-orange-100 rounded-3xl text-center text-3xl font-black text-orange-800" placeholder="22"/>
              </div>
            </div>
          </Card>
          
          <button onClick={() => {
            setHistory([{...config, id: Date.now(), d: new Date().toLocaleString(), note: "Medición inicial"}, ...history]);
            setStep(4);
            setTab("overview");
          }} className="w-full bg-gradient-to-r from-orange-500 to-red-500 text-white p-7 rounded-[2.5rem] font-black uppercase text-xl shadow-2xl">
            Registrar e Iniciar Sistema
          </button>
        </Card>
      </div>
    );
  }

  const calendarDays = generateCalendar();
  
  return (
    <div className="min-h-screen bg-slate-50 pb-28 text-slate-900 font-sans">
      <header className="bg-white border-b-4 p-6 flex justify-between items-center sticky top-0 z-50">
        <div>
          <h1 className="text-2xl font-black italic text-green-700 leading-none uppercase">HydroCaru v4.0</h1>
          <p className="text-[8px] font-black uppercase tracking-widest text-slate-300 italic">Sistema Inteligente de Cultivo</p>
        </div>
        <div className="flex items-center gap-3">
          <Badge className="bg-gradient-to-r from-green-500 to-emerald-600 text-white px-4 py-2 rounded-2xl font-black text-lg">
            {config.currentVol}L
          </Badge>
          {alerts.length > 0 && (
            <div className="relative">
              <Bell className="text-amber-600" size={22} />
              <span className="absolute -top-1 -right-1 bg-red-600 text-white text-[10px] font-black rounded-full w-5 h-5 flex items-center justify-center animate-ping">
                {alerts.filter(a => a.priority === 1).length}
              </span>
            </div>
          )}
        </div>
      </header>

      <main className="container mx-auto p-4 max-w-md">
        <Tabs value={tab} onValueChange={setTab}>
          <TabsList className="grid grid-cols-6 bg-white border-4 border-slate-100 shadow-xl rounded-[2.5rem] mb-8 h-18 p-1">
            <TabsTrigger value="overview" className="relative">
              <Activity />
              {alerts.length > 0 && <span className="absolute -top-1 -right-1 w-2 h-2 bg-red-600 rounded-full"></span>}
            </TabsTrigger>
            <TabsTrigger value="measure"><Beaker /></TabsTrigger>
            <TabsTrigger value="tower"><Layers /></TabsTrigger>
            <TabsTrigger value="calendar"><Calendar /></TabsTrigger>
            <TabsTrigger value="tips"><Lightbulb /></TabsTrigger>
            <TabsTrigger value="settings"><Trash2 /></TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-4">
            <Card className="p-5 rounded-[2rem] bg-gradient-to-r from-slate-50 to-blue-50 border-2">
              <p className="text-[10px] font-black uppercase text-slate-400 mb-3">COMPOSICIÓN DEL CULTIVO</p>
              <div className="flex justify-around">
                <div className="text-center">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-b from-blue-200 to-blue-300 flex items-center justify-center mx-auto mb-1 shadow-inner">
                    <Sprout className="text-blue-700" size={24} />
                  </div>
                  <p className="text-xl font-black text-blue-700">{plants.filter(p => p.l === 1).length}</p>
                  <p className="text-[9px] font-bold text-slate-600">Plántulas</p>
                </div>
                <div className="text-center">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-b from-purple-200 to-purple-300 flex items-center justify-center mx-auto mb-1 shadow-inner">
                    <Activity className="text-purple-700" size={24} />
                  </div>
                  <p className="text-xl font-black text-purple-700">{plants.filter(p => p.l === 2).length}</p>
                  <p className="text-[9px] font-bold text-slate-600">Crecimiento</p>
                </div>
                <div className="text-center">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-b from-green-200 to-green-300 flex items-center justify-center mx-auto mb-1 shadow-inner">
                    <Check className="text-green-700" size={24} />
                  </div>
                  <p className="text-xl font-black text-green-700">{plants.filter(p => p.l === 3).length}</p>
                  <p className="text-[9px] font-bold text-slate-600">Maduras</p>
                </div>
              </div>
            </Card>
            
            {alerts.length > 0 ? (
              <div className="space-y-4">
                <div className="flex items-center gap-2 px-2">
                  <Bell className="text-amber-600" size={18} />
                  <p className="text-[11px] font-black uppercase text-slate-500">ALERTAS DEL SISTEMA ({alerts.length})</p>
                </div>
                {alerts.map((alert, i) => (
                  <Card key={i} className={`${alert.c} text-white p-6 rounded-[2.5rem] flex items-center gap-5 border-none shadow-xl animate-in slide-in-from-right`}>
                    <div className="bg-white/20 p-3 rounded-2xl backdrop-blur-sm">
                      {alert.icon}
                    </div>
                    <div className="flex-1">
                      <div className="flex justify-between items-start">
                        <p className="text-sm font-black uppercase opacity-90 mb-1">{alert.t}</p>
                        {alert.priority === 1 && (
                          <span className="bg-white/30 text-[8px] font-black px-2 py-1 rounded-full">URGENTE</span>
                        )}
                      </div>
                      <p className="text-2xl font-black italic leading-none mb-1">{alert.v}</p>
                      <p className="text-[10px] font-bold opacity-80 leading-tight">{alert.d}</p>
                    </div>
                  </Card>
                ))}
              </div>
            ) : (
              <Card className="p-12 text-center font-black text-green-700 border-4 border-green-100 bg-gradient-to-b from-green-50 to-emerald-50 rounded-[3rem] shadow-lg">
                <Check className="mx-auto mb-4 bg-white rounded-full p-4 text-green-600 shadow-lg" size={50}/>
                <p className="text-xl mb-2">SISTEMA EN EQUILIBRIO</p>
                <p className="text-[12px] font-normal text-slate-600">Todos los parámetros están dentro de los rangos óptimos</p>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="measure">
            <Card className="p-8 rounded-[3rem] bg-white shadow-2xl border-2 space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1"><label className="text-[9px] font-black uppercase text-slate-400 ml-4">pH Medido</label><input type="number" step="0.1" value={config.ph} onChange={e => setConfig({...config, ph: e.target.value})} className="w-full p-5 bg-slate-50 border-4 rounded-3xl text-center text-3xl font-black" /></div>
                <div className="space-y-1"><label className="text-[9px] font-black uppercase text-slate-400 ml-4">EC Medida</label><input type="number" step="0.1" value={config.ec} onChange={e => setConfig({...config, ec: e.target.value})} className="w-full p-5 bg-slate-50 border-4 rounded-3xl text-center text-3xl font-black" /></div>
                <div className="space-y-1 col-span-2"><label className="text-[9px] font-black uppercase text-cyan-600 ml-4">Litros actuales en depósito</label><input type="number" value={config.currentVol} onChange={e => setConfig({...config, currentVol: e.target.value})} className="w-full p-5 bg-cyan-50 border-4 border-cyan-100 rounded-3xl text-center text-4xl font-black text-cyan-800" /></div>
                <div className="space-y-1 col-span-2"><label className="text-[9px] font-black uppercase text-orange-600 ml-4">Temperatura Agua °C</label><input type="number" value={config.temp} onChange={e => setConfig({...config, temp: e.target.value})} className="w-full p-5 bg-orange-50 border-4 border-orange-100 rounded-3xl text-center text-3xl font-black text-orange-800" /></div>
              </div>
              <button onClick={() => { 
                setHistory([{...config, id: Date.now(), d: new Date().toLocaleString()}, ...history]); 
                setTab("overview");
                alert("✅ Medición registrada correctamente");
              }} className="w-full bg-gradient-to-r from-slate-800 to-slate-900 text-white p-7 rounded-[2.5rem] font-black uppercase text-xl shadow-2xl">
                Registrar Mediciones
              </button>
            </Card>
          </TabsContent>

          <TabsContent value="tower" className="space-y-6">
            <button onClick={handleRotation} className="w-full p-8 rounded-[2.5rem] bg-gradient-to-r from-orange-500 to-red-500 text-white font-black flex items-center justify-center gap-4 shadow-2xl border-b-8 border-orange-800 active:border-b-0 active:translate-y-1 transition-all">
                <Scissors size={28}/> 
                <div className="text-left leading-none">
                  <p className="text-[10px] uppercase opacity-70 mb-1">Cosecha y Descenso</p>
                  <p className="text-xl uppercase italic">Rotar Niveles de Torre</p>
                </div>
            </button>
            {[1, 2, 3].map(l => (
              <div key={l}>
                <p className="text-[10px] font-black mb-3 px-4 flex justify-between uppercase italic text-slate-400">
                    <span>Nivel {l} {l===1?'(Siembra)':l===3?'(Cosecha)':'(Crecimiento)'}</span>
                    <Badge variant="outline" className="border-2">{plants.filter(p => p.l === l).length}/6</Badge>
                </p>
                <div className="bg-slate-200/50 p-5 rounded-[2.5rem] grid grid-cols-3 gap-4 border-4 border-white shadow-inner">
                  {[1, 2, 3, 4, 5, 6].map(p => {
                    const pl = plants.find(x => x.l === l && x.p === p);
                    return (
                      <button key={p} onClick={() => pl ? setPlants(plants.filter(x => x.id !== pl.id)) : setSelPos({l, p})} className={`aspect-square rounded-[1.8rem] flex flex-col items-center justify-center border-4 relative transition-all ${pl ? `${VARIETIES[pl.v].color} border-white shadow-xl scale-110` : 'bg-white border-slate-100 hover:bg-slate-50'}`}>
                        {pl ? <Sprout size={28} className="text-white" /> : <Plus size={24} className="text-slate-300" />}
                        {pl && <span className="text-[7px] font-black text-white absolute bottom-1 uppercase px-1 truncate w-full text-center leading-none">{pl.v}</span>}
                      </button>
                    )
                  })}
                </div>
              </div>
            ))}
          </TabsContent>

          <TabsContent value="calendar" className="space-y-6">
            <Card className="p-8 rounded-[3.5rem] bg-gradient-to-br from-indigo-950 to-purple-950 text-white shadow-2xl relative overflow-hidden border-4 border-indigo-900">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-black italic text-indigo-200 uppercase">Calendario Inteligente</h3>
                <div className="flex items-center gap-2 bg-white/10 px-3 py-1 rounded-full">
                  <Calendar size={16} />
                  <span className="text-[10px] font-black">15 días</span>
                </div>
              </div>
              
              <div className="mb-6 grid grid-cols-3 gap-3 text-center">
                <div className="p-3 bg-blue-900/50 rounded-2xl">
                  <p className="text-[10px] font-black text-blue-300 uppercase">Mediciones</p>
                  <p className="text-xl font-black">{plants.length > 12 ? 'Cada 2 días' : plants.length > 6 ? 'Cada 3 días' : 'Cada 4 días'}</p>
                </div>
                <div className="p-3 bg-orange-900/50 rounded-2xl">
                  <p className="text-[10px] font-black text-orange-300 uppercase">Rotaciones</p>
                  <p className="text-xl font-black">Cada 7 días</p>
                </div>
                <div className="p-3 bg-red-900/50 rounded-2xl">
                  <p className="text-[10px] font-black text-red-300 uppercase">Limpieza</p>
                  <p className="text-xl font-black">Cada 14 días</p>
                </div>
              </div>
              
              <div className="grid grid-cols-5 gap-3">
                {calendarDays.map((day, i) => (
                  <div key={i} className={`relative rounded-xl p-3 text-center border-2 ${day.type === 'critical' ? 'bg-gradient-to-b from-red-600 to-rose-800 border-red-400 shadow-lg shadow-red-900/50 animate-pulse' : day.type === 'clean' ? 'bg-gradient-to-b from-red-700 to-red-900 border-red-500' : day.type === 'rotation' ? 'bg-gradient-to-b from-orange-600 to-amber-800 border-orange-400' : day.type === 'measure' ? 'bg-gradient-to-b from-blue-600 to-blue-800 border-blue-400' : 'bg-white/5 border-transparent'}`}>
                    <p className={`text-lg font-black ${day.type === 'normal' ? 'text-white/30' : 'text-white'}`}>{day.day}</p>
                    {day.label && (
                      <>
                        <p className="text-[8px] font-black uppercase mt-1">{day.label}</p>
                        <div className={`absolute -top-1 -right-1 w-5 h-5 rounded-full flex items-center justify-center ${day.type === 'critical' ? 'bg-red-400' : day.type === 'clean' ? 'bg-red-500' : day.type === 'rotation' ? 'bg-orange-400' : 'bg-blue-500'}`}>
                          <Info size={10} className="text-white" />
                        </div>
                      </>
                    )}
                  </div>
                ))}
              </div>
              
              <div className="mt-8 pt-6 border-t border-white/10">
                <p className="text-[10px] font-black uppercase text-indigo-300 mb-3">LEYENDA DEL CALENDARIO</p>
                <div className="grid grid-cols-2 gap-3">
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 bg-gradient-to-b from-blue-600 to-blue-800 rounded"></div>
                    <span className="text-[9px] text-white/80">Medir parámetros</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 bg-gradient-to-b from-orange-600 to-amber-800 rounded"></div>
                    <span className="text-[9px] text-white/80">Rotar niveles</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 bg-gradient-to-b from-red-700 to-red-900 rounded"></div>
                    <span className="text-[9px] text-white/80">Limpieza depósito</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 bg-gradient-to-b from-red-600 to-rose-800 rounded animate-pulse"></div>
                    <span className="text-[9px] text-white/80">Doble tarea</span>
                  </div>
                </div>
              </div>
            </Card>
            
            <div className="space-y-2">
              <h4 className="text-[9px] font-black uppercase text-slate-400 ml-4 tracking-widest">Últimos Registros</h4>
              {history.slice(0, 5).map(h => (
                <div key={h.id} className="p-4 bg-white border-2 rounded-2xl flex justify-between items-center text-xs font-black italic">
                  <span className="text-slate-400">{h.d.split(',')[0]}</span>
                  <div className="flex gap-4 uppercase">
                    <span className="text-purple-600">pH {h.ph}</span>
                    <span className="text-blue-600">EC {h.ec}</span>
                    <span className="text-orange-500">{h.temp}°C</span>
                  </div>
                </div>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="tips" className="space-y-6">
            <h2 className="text-2xl font-black uppercase italic text-slate-800 ml-4">Consejos Maestros</h2>
            
            <HydroCalc />
            
            <Card className="rounded-[3rem] border-4 border-cyan-100 overflow-hidden shadow-xl bg-white">
              <div className="bg-gradient-to-r from-cyan-600 to-teal-600 p-6 text-white flex items-center gap-4">
                <RefreshCw size={30}/>
                <h3 className="font-black uppercase text-xs tracking-widest">TRASPLANTE: VIVERO A LANA DE ROCA</h3>
              </div>
              <div className="p-8 text-[11px] font-bold text-slate-700 italic leading-relaxed space-y-4">
                <p>• <span className="text-cyan-700 uppercase font-black">Preparación Crítica:</span> La plántula de vivero viene con tierra. Remueve CON CUIDADO el 80% de la tierra bajo agua corriente TIBIA para no romper raíces. Nunca tires, lava suavemente con dedos.</p>
                <p>• <span className="text-cyan-700 uppercase font-black">Aclimatación a Lana:</span> La lana de roca debe estar PRE-MOJADA con solución de EC 0.6 y pH 5.8. Haz un hoyo en el cubo de lana, introduce las raíces limpias y rodea con trozos sueltos de lana para sostener.</p>
                <p>• <span className="text-cyan-700 uppercase font-black">Primera Semana Post-Trasplante:</span> Mantén EC en 0.6-0.8 y pH 5.8-6.0. Las raíces están en shock. NO fertilices hasta ver nuevo crecimiento (3-5 días). Luz: 16h pero a 50cm de distancia para no estresar.</p>
                <p>• <span className="text-cyan-700 uppercase font-black">Señal de Éxito:</span> Si a los 2 días las hojas están turgentes (no mustias) y en 5 días ves raíces blancas asomando por el cubo de lana, el trasplante fue perfecto.</p>
              </div>
            </Card>
            
            <Card className="rounded-[3rem] border-4 border-emerald-100 overflow-hidden shadow-xl bg-white">
              <div className="bg-gradient-to-r from-emerald-600 to-green-600 p-6 text-white flex items-center gap-4"><Sprout size={30}/><h3 className="font-black uppercase text-xs tracking-widest">🌱 PLANTEL Y GERMINACIÓN</h3></div>
              <div className="p-8 text-[11px] font-bold text-slate-700 italic leading-relaxed space-y-4">
                <p>• <span className="text-emerald-700 uppercase font-black">Luz Inicial:</span> Una vez germinen, necesitan 16-18h de luz. Si el tallo se estira mucho (ahilado), acerca la luz; la planta busca energía y gasta reservas vitales.</p>
                <p>• <span className="text-emerald-700 uppercase font-black">Primeros Nutrientes:</span> No uses EC alta al nacer. Empieza con 0.6 - 0.8 mS/cm. La raíz joven es extremadamente sensible y una dosis alta de sales la deshidratará (plasmólisis).</p>
                <p>• <span className="text-emerald-700 uppercase font-black">Humedad:</span> Mantén el entorno al 70-80% las primeras 2 semanas para que la hoja no transpire más de lo que la raíz puede absorber.</p>
              </div>
            </Card>

            <Card className="rounded-[3rem] border-4 border-orange-100 overflow-hidden shadow-xl bg-white">
              <div className="bg-gradient-to-r from-orange-500 to-amber-600 p-6 text-white flex items-center gap-4"><Layers size={30}/><h3 className="font-black uppercase text-xs tracking-widest">🧪 PREPARACIÓN DEL SUSTRATO</h3></div>
              <div className="p-8 text-[11px] font-bold text-slate-700 italic leading-relaxed space-y-4">
                <p>• <span className="text-orange-600 uppercase font-black">Neutralizado Pro:</span> La lana es roca fundida y es alcalina (pH 8+). Sumerge en agua con pH 5.2-5.5 durante 24h. Esto estabiliza los silicatos y permite que el fósforo esté disponible desde el minuto 1.</p>
                <p>• <span className="text-orange-600 uppercase font-black">Drenaje Maestro:</span> Tras el remojo, deja que escurra por gravedad. **PROHIBIDO ESTRUJAR**. Al apretarla, destruyes el 50% de los microporos de aire. La lana de roca debe tener un ratio 60% agua / 40% aire para evitar la pudrición radicular.</p>
              </div>
            </Card>

            <Card className="rounded-[3rem] border-4 border-blue-100 overflow-hidden shadow-xl bg-white">
              <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-6 text-white flex items-center gap-4"><Anchor size={30}/><h3 className="font-black uppercase text-xs tracking-widest">💧 GESTIÓN DEL AGUA</h3></div>
              <div className="p-8 text-[11px] font-bold text-slate-700 italic leading-relaxed space-y-4">
                <p>• <span className="text-blue-700 uppercase font-black">Orden de Mezcla:</span> Primero regula el pH del agua sola, luego añade Nutriente A, mezcla bien, y luego Nutriente B. Si mezclas A y B puros, los minerales precipitan y se vuelven piedras insolubles.</p>
                <p>• <span className="text-blue-700 uppercase font-black">Bio-Film:</span> Si el agua huele a pantano, limpia el depósito con agua oxigenada al 3% para desinfectar las paredes antes de volver a llenar.</p>
              </div>
            </Card>
          </TabsContent>

          <TabsContent value="settings" className="space-y-6 py-10">
            <button onClick={() => { 
              setLastClean(new Date().toISOString()); 
              alert('✅ Limpieza registrada. El calendario se reiniciará.'); 
            }} className="w-full bg-gradient-to-r from-violet-500 to-purple-600 text-white p-8 rounded-[2.5rem] font-black border-4 border-violet-200 uppercase text-sm flex items-center justify-center gap-2 shadow-xl">
              <ShieldAlert className="text-white"/> Registrar Limpieza Completa Hoy
            </button>
            
            <button onClick={() => { 
              if(confirm('¿RESETEO COMPLETO?\n\nSe borrarán:\n• Todas las plantas\n• Historial de mediciones\n• Configuración\n\n¿Continuar?')) { 
                localStorage.clear(); 
                window.location.reload(); 
              }
            }} className="w-full bg-gradient-to-r from-red-500 to-rose-600 text-white p-10 rounded-[2.5rem] font-black border-4 border-red-200 uppercase text-sm shadow-xl hover:scale-[1.02] transition-all">
              RESETEO MAESTRO COMPLETO
            </button>
            
            <p className="text-center text-[10px] font-black text-slate-300 uppercase italic tracking-widest pt-10 leading-relaxed">
              HydroCaru Master v4.0<br/>
              Sistema Inteligente de Cultivo Escalonado
            </p>
          </TabsContent>
        </Tabs>
      </main>

      {selPos && step === 4 && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md flex items-end p-4 z-[9999]">
          <div className="bg-white w-full max-w-md mx-auto rounded-[4rem] p-12 space-y-4 shadow-2xl animate-in slide-in-from-bottom duration-300">
            <div className="flex justify-between items-center mb-4">
                <h3 className="font-black italic text-slate-400 uppercase text-sm">Seleccionar Variedad</h3>
                <button onClick={() => setSelPos(null)} className="p-2 bg-slate-100 rounded-full text-slate-400"><Plus size={24} className="rotate-45"/></button>
            </div>
            <div className="grid gap-3">
              {Object.keys(VARIETIES).map(v => (
                <button key={v} onClick={() => {
                  const newPlant = {
                    id: generatePlantId(),
                    v, 
                    l: selPos.l, 
                    p: selPos.p
                  };
                  setPlants([...plants, newPlant]); 
                  setSelPos(null);
                }} className={`w-full p-7 rounded-[2.2rem] font-black text-white shadow-xl flex justify-between items-center hover:scale-105 active:scale-95 transition-all ${VARIETIES[v].color}`}>
                    <div className="text-left">
                        <span className="text-2xl uppercase italic tracking-tighter leading-none block">{v}</span>
                        <span className="text-[10px] opacity-80 lowercase font-medium">EC máx: {VARIETIES[v].ecMax}</span>
                    </div>
                    <Zap size={24}/>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
