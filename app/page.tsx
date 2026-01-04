"use client"

import React, { useState, useEffect, useMemo } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { 
  Sprout, Activity, Layers, Beaker, Calendar, 
  Plus, Trash2, FlaskConical, ArrowDownCircle, Check, 
  Lock, Lightbulb, Scissors, Clock, AlertTriangle, Wind, Droplets, Thermometer, Zap, ShieldAlert, ChevronRight, Anchor, ArrowLeft, ArrowRight, Bell, CloudRain, ThermometerSun, RefreshCw, Skull, Info, Leaf
} from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Card } from "@/components/ui/card"

// ==================== BASE DE DATOS DE VARIEDADES ====================
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

// ==================== FUNCIONES DE CÁLCULO INTELIGENTE ====================
// FUNCIÓN PRINCIPAL: Calcula EC/pH óptimos basado en TODAS las variables actuales
const calculateOptimalValues = (plants, currentVolume, totalVolume) => {
  if (plants.length === 0) {
    return { 
      targetEC: "0.8", 
      targetPH: "6.0",
      note: "Sistema vacío - Valores por defecto"
    };
  }
  
  let totalECWeighted = 0;
  let totalPH = 0;
  let seedlingCount = 0, growthCount = 0, matureCount = 0;
  
  // 1. CALCULAR CONTRIBUCIÓN DE CADA PLANTA
  plants.forEach(plant => {
    const variety = VARIETIES[plant.v];
    if (!variety) return;
    
    // Determinar etapa según nivel
    let stage, weight;
    if (plant.l === 1) { 
      stage = "seedling"; 
      weight = 0.35; // Plántula: 35% de EC máxima
      seedlingCount++;
    } else if (plant.l === 2) { 
      stage = "growth"; 
      weight = 0.75; // Crecimiento: 75% de EC máxima
      growthCount++;
    } else { 
      stage = "mature"; 
      weight = 1.0; // Maduración: 100% de EC máxima
      matureCount++;
    }
    
    // EC para esta planta = EC máxima × peso según etapa
    const plantEC = variety.ecMax * weight;
    totalECWeighted += plantEC;
    totalPH += variety.phIdeal;
  });
  
  // 2. CALCULAR PROMEDIO DEL SISTEMA
  let systemEC = totalECWeighted / plants.length;
  const systemPH = totalPH / plants.length;
  
  // 3. AJUSTES INTELIGENTES
  
  // A. Si hay muchas plántulas, bajar EC para protegerlas
  const seedlingRatio = seedlingCount / plants.length;
  if (seedlingRatio > 0.5) {
    systemEC *= 0.85; // Reducir 15% si >50% son plántulas
  }
  
  // B. Ajuste por volumen actual (no por volumen total)
  // Menor volumen = fluctuaciones más rápidas = EC más conservadora
  const volumeRatio = currentVolume / totalVolume;
  if (volumeRatio < 0.3) {
    systemEC *= 0.9; // Volumen muy bajo: bajar EC 10%
  } else if (volumeRatio < 0.5) {
    systemEC *= 0.95; // Volumen bajo: bajar EC 5%
  }
  
  // C. Si predominan plantas adultas, subir ligeramente
  if (matureCount > seedlingCount * 2) {
    systemEC *= 1.1; // Más adultas: aumentar EC 10%
  }
  
  // 4. LIMITAR A RANGOS SEGUROS
  systemEC = Math.max(0.6, Math.min(2.0, systemEC));
  
  return {
    targetEC: systemEC.toFixed(2),
    targetPH: systemPH.toFixed(1),
    statistics: {
      totalPlants: plants.length,
      seedlingCount,
      growthCount,
      matureCount,
      seedlingPercentage: Math.round((seedlingCount / plants.length) * 100)
    },
    note: `Sistema con ${plants.length} plantas (${seedlingCount}P/${growthCount}C/${matureCount}M) en ${currentVolume}L/${totalVolume}L`
  };
};

// FUNCIÓN: Calcular dosificación Hy-Pro
const calculateHyproDosage = (plants, currentVolume, targetEC) => {
  if (plants.length === 0 || currentVolume <= 0) {
    return { a: 0, b: 0, per10L: { a: 0, b: 0 } };
  }
  
  let totalA = 0, totalB = 0;
  
  plants.forEach(plant => {
    const variety = VARIETIES[plant.v];
    if (!variety) return;
    
    // Determinar etapa según nivel
    let stage;
    if (plant.l === 1) stage = "seedling";
    else if (plant.l === 2) stage = "growth";
    else stage = "mature";
    
    const dosage = variety.hyproDosage[stage];
    
    // Dosis proporcional: (dosis/10L) × (volumen actual / número de plantas)
    const plantContribution = (dosage.a / 10) * (currentVolume / plants.length);
    totalA += plantContribution;
    totalB += plantContribution;
  });
  
  // Ajustar según EC objetivo vs referencia (1.4)
  const ecRatio = parseFloat(targetEC) / 1.4;
  totalA *= ecRatio;
  totalB *= ecRatio;
  
  return {
    a: Math.round(totalA),
    b: Math.round(totalB),
    per10L: {
      a: Math.round((totalA * 10) / currentVolume),
      b: Math.round((totalB * 10) / currentVolume)
    }
  };
};

// ==================== COMPONENTE PRINCIPAL ====================
export default function HydroAppFinalV31() {
  const [step, setStep] = useState(0);
  const [plants, setPlants] = useState([]);
  const [history, setHistory] = useState([]);
  const [lastRot, setLastRot] = useState(new Date().toISOString());
  const [lastClean, setLastClean] = useState(new Date().toISOString());
  const [config, setConfig] = useState({ 
    totalVol: "20", 
    currentVol: "20", 
    ph: "6.0", 
    ec: "1.2", 
    temp: "22",
    targetEC: "1.4", 
    targetPH: "6.0"
  });
  const [tab, setTab] = useState("overview");
  const [selPos, setSelPos] = useState(null);

  // ==================== CÁLCULO EN TIEMPO REAL ====================
  // Esto se ejecuta CADA VEZ que cambian las plantas o el volumen
  const currentOptimalValues = useMemo(() => {
    return calculateOptimalValues(
      plants,
      parseFloat(config.currentVol) || 0,
      parseFloat(config.totalVol) || 20
    );
  }, [plants, config.currentVol, config.totalVol]);

  const currentHyproDosage = useMemo(() => {
    return calculateHyproDosage(
      plants,
      parseFloat(config.currentVol) || 0,
      currentOptimalValues.targetEC
    );
  }, [plants, config.currentVol, currentOptimalValues.targetEC]);

  // ==================== EFECTOS AUTOMÁTICOS ====================
  // 1. Cargar datos guardados
  useEffect(() => {
    const saved = localStorage.getItem("hydro_master_v31");
    if (saved) {
      try {
        const d = JSON.parse(saved);
        setPlants(d.plants || []);
        setConfig(d.config || config);
        setHistory(d.history || []);
        setLastRot(d.lastRot || new Date().toISOString());
        setLastClean(d.lastClean || new Date().toISOString());
        setStep(3); // Ir directamente al panel si ya hay datos
      } catch (e) {
        console.error("Error cargando datos:", e);
      }
    }
  }, []);

  // 2. Guardar automáticamente
  useEffect(() => {
    if (step >= 2) {
      localStorage.setItem("hydro_master_v31", 
        JSON.stringify({ 
          plants, 
          config: {
            ...config,
            targetEC: currentOptimalValues.targetEC,
            targetPH: currentOptimalValues.targetPH
          }, 
          history, 
          lastRot, 
          lastClean 
        })
      );
    }
  }, [plants, config, history, lastRot, lastClean, step, currentOptimalValues]);

  // 3. Actualizar EC objetivo automáticamente cuando cambia el cálculo
  useEffect(() => {
    if (step >= 2 && plants.length > 0) {
      setConfig(prev => ({
        ...prev,
        targetEC: currentOptimalValues.targetEC,
        targetPH: currentOptimalValues.targetPH
      }));
    }
  }, [currentOptimalValues, step, plants.length]);

  // ==================== PANTALLA 1: VOLUMEN ====================
  if (step === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-blue-50 to-cyan-100 flex items-center justify-center p-6">
        <Card className="w-full max-w-md p-12 bg-white rounded-[4rem] text-center border-b-8 border-cyan-500 shadow-2xl">
          <div className="mx-auto mb-8 w-24 h-24 bg-gradient-to-r from-cyan-400 to-blue-500 rounded-full flex items-center justify-center shadow-lg">
            <Droplets className="text-white" size={48} />
          </div>
          
          <h1 className="text-3xl font-black mb-2 text-slate-800 uppercase italic">HydroCaru</h1>
          <p className="text-sm font-bold mb-10 text-slate-400 uppercase tracking-widest">Configuración Inicial</p>
          
          <div className="mb-10">
            <h2 className="text-2xl font-black mb-4 text-cyan-700">PASO 1: CONFIGURAR DEPÓSITO</h2>
            <p className="text-sm font-bold mb-6 text-slate-500">Capacidad total de agua (Litros)</p>
            
            <div className="relative">
              <input 
                type="number" 
                value={config.totalVol} 
                onChange={e => setConfig({
                  ...config, 
                  totalVol: e.target.value, 
                  currentVol: e.target.value
                })} 
                className="w-full p-8 bg-gradient-to-b from-slate-50 to-white border-4 border-cyan-100 rounded-[3rem] text-6xl font-black text-center text-cyan-800 shadow-inner"
                placeholder="20"
                min="5"
                max="100"
              />
              <div className="absolute right-8 top-1/2 transform -translate-y-1/2">
                <span className="text-2xl font-black text-cyan-400">L</span>
              </div>
            </div>
            
            <p className="text-xs text-slate-400 mt-6">
              💡 La app calculará automáticamente los nutrientes según el volumen actual
            </p>
          </div>
          
          <button 
            onClick={() => {
              if (parseFloat(config.totalVol) < 5) {
                alert("Por favor, introduce un volumen válido (mínimo 5L)");
                return;
              }
              setStep(1);
            }} 
            className="w-full bg-gradient-to-r from-cyan-500 to-blue-600 text-white p-7 rounded-[2.5rem] font-black uppercase text-xl shadow-2xl flex items-center justify-center gap-3 hover:shadow-3xl transition-all"
          >
            Continuar a Selección de Plantas
            <ChevronRight size={24} />
          </button>
        </Card>
      </div>
    );
  }

  // ==================== PANTALLA 2: SELECCIÓN DE 6 PLÁNTULAS ====================
  if (step === 1) {
    const level1Plants = plants.filter(p => p.l === 1);
    
    return (
      <div className="min-h-screen bg-gradient-to-b from-emerald-50 to-green-100 flex items-center justify-center p-4">
        <Card className="w-full max-w-md p-10 bg-white rounded-[4rem] shadow-2xl">
          <div className="flex items-center justify-between mb-10">
            <button onClick={() => setStep(0)} className="p-3 bg-slate-100 rounded-full">
              <ArrowLeft className="text-slate-500" size={24} />
            </button>
            
            <div className="text-center">
              <h2 className="text-2xl font-black uppercase italic text-emerald-700">PASO 2: PRIMERAS 6 PLÁNTULAS</h2>
              <p className="text-sm font-bold text-slate-400">Selecciona variedades para el Nivel 1</p>
            </div>
            
            <div className="w-12"></div>
          </div>
          
          <div className="mb-8">
            <div className="flex justify-between items-center mb-2">
              <span className="text-xs font-black text-emerald-600 uppercase">
                {level1Plants.length}/6 Seleccionadas
              </span>
              <Badge className={`px-4 py-1 rounded-full font-black ${level1Plants.length === 6 ? 'bg-emerald-500' : 'bg-amber-500'}`}>
                {level1Plants.length === 6 ? 'Completo' : 'Pendiente'}
              </Badge>
            </div>
            <div className="h-4 bg-slate-100 rounded-full overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-emerald-400 to-green-500 transition-all duration-300"
                style={{ width: `${(level1Plants.length / 6) * 100}%` }}
              ></div>
            </div>
          </div>
          
          {/* Torre visual */}
          <div className="mb-10">
            <div className="bg-gradient-to-b from-emerald-100 to-green-50 p-8 rounded-[3rem] border-4 border-emerald-200 shadow-inner">
              <div className="grid grid-cols-3 gap-5">
                {[1, 2, 3, 4, 5, 6].map(position => {
                  const plant = plants.find(p => p.l === 1 && p.p === position);
                  
                  return (
                    <button
                      key={position}
                      onClick={() => {
                        if (plant) {
                          setPlants(plants.filter(p => p.id !== plant.id));
                        } else if (level1Plants.length < 6) {
                          setSelPos({ l: 1, p: position });
                        } else {
                          alert("Ya tienes 6 plántulas. Elimina una primero.");
                        }
                      }}
                      className={`aspect-square rounded-[2rem] flex flex-col items-center justify-center border-4 relative transition-all ${
                        plant 
                          ? `${VARIETIES[plant.v].color} border-white shadow-xl scale-105` 
                          : 'bg-gradient-to-b from-white to-slate-50 border-emerald-100'
                      }`}
                    >
                      {plant ? (
                        <>
                          <Leaf className="text-white" size={32} />
                          <span className="text-[9px] font-black text-white absolute bottom-2 uppercase px-2 truncate w-full text-center">
                            {plant.v}
                          </span>
                        </>
                      ) : (
                        <>
                          <Plus className="text-emerald-300" size={28} />
                          <span className="text-[10px] font-black text-emerald-400 mt-2 uppercase">
                            Pos {position}
                          </span>
                        </>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
            
            {/* CÁLCULO EN TIEMPO REAL */}
            {level1Plants.length > 0 && (
              <Card className="mt-6 p-6 rounded-[2.5rem] bg-gradient-to-r from-blue-50 to-cyan-50 border-2 border-blue-100">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-[11px] font-black uppercase text-slate-400 mb-1">
                      EC CALCULADA EN TIEMPO REAL
                    </p>
                    <p className="text-4xl font-black italic text-blue-700 leading-none">
                      {calculateOptimalValues(
                        level1Plants,
                        parseFloat(config.currentVol),
                        parseFloat(config.totalVol)
                      ).targetEC} mS/cm
                    </p>
                    <p className="text-[10px] font-bold text-slate-500 mt-1">
                      Para {level1Plants.length} plántulas con {config.currentVol}L/{config.totalVol}L
                    </p>
                  </div>
                  <div className="p-3 bg-white rounded-2xl shadow">
                    <RefreshCw className="text-blue-500" size={32} />
                  </div>
                </div>
                
                <div className="mt-4 pt-4 border-t border-blue-100">
                  <p className="text-[10px] font-black text-blue-600 uppercase mb-2">
                    💡 La app recalculará automáticamente cuando:
                  </p>
                  <ul className="text-[9px] text-slate-600 space-y-1">
                    <li>• Añadas más plantas o cambies variedades</li>
                    <li>• Rotes niveles (semanalmente)</li>
                    <li>• Cambie el volumen de agua</li>
                  </ul>
                </div>
              </Card>
            )}
          </div>
          
          <button
            onClick={() => {
              if (level1Plants.length === 6) {
                setStep(2);
              } else {
                alert(`Necesitas seleccionar 6 plántulas. Tienes ${level1Plants.length}/6.`);
              }
            }}
            disabled={level1Plants.length !== 6}
            className={`w-full p-8 rounded-[2.5rem] font-black uppercase text-xl shadow-2xl flex items-center justify-center gap-3 ${
              level1Plants.length === 6
                ? 'bg-gradient-to-r from-emerald-500 to-green-600 text-white hover:shadow-3xl'
                : 'bg-slate-100 text-slate-400 cursor-not-allowed'
            }`}
          >
            {level1Plants.length === 6 ? (
              <>
                <span>Ver Resumen y Comenzar</span>
                <ArrowRight size={24} />
              </>
            ) : (
              `Selecciona ${6 - level1Plants.length} más`
            )}
          </button>
        </Card>
      </div>
    );
  }

  // ==================== PANTALLA 3: RESUMEN FINAL ====================
  if (step === 2) {
    const level1Plants = plants.filter(p => p.l === 1);
    const initialValues = calculateOptimalValues(
      level1Plants,
      parseFloat(config.currentVol),
      parseFloat(config.totalVol)
    );
    
    return (
      <div className="min-h-screen bg-gradient-to-b from-amber-50 to-orange-100 flex items-center justify-center p-4">
        <Card className="w-full max-w-md p-12 bg-white rounded-[4rem] shadow-2xl">
          
          <div className="text-center mb-10">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-r from-green-400 to-emerald-500 rounded-full mb-6 shadow-lg">
              <Check className="text-white" size={36} />
            </div>
            
            <h2 className="text-3xl font-black uppercase italic text-emerald-700 mb-3">
              ¡Sistema Listo!
            </h2>
            <p className="text-sm font-bold text-slate-400">
              Valores calculados para tu configuración inicial
            </p>
          </div>
          
          {/* Resumen de cálculo */}
          <Card className="p-8 rounded-[3rem] bg-gradient-to-r from-emerald-50 to-green-50 border-2 border-emerald-100 mb-6">
            <div className="flex items-center justify-between mb-6">
              <div>
                <p className="text-[12px] font-black uppercase text-slate-400 mb-1">
                  VALORES CALCULADOS
                </p>
                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <p className="text-5xl font-black italic text-emerald-700 leading-none">
                      {initialValues.targetEC}
                    </p>
                    <p className="text-[11px] font-bold text-slate-500">EC (mS/cm)</p>
                  </div>
                  <div>
                    <p className="text-5xl font-black italic text-emerald-700 leading-none">
                      {initialValues.targetPH}
                    </p>
                    <p className="text-[11px] font-bold text-slate-500">pH</p>
                  </div>
                </div>
                <p className="text-[11px] font-bold text-slate-500 mt-4">
                  Para 6 plántulas con {config.currentVol}L de {config.totalVol}L total
                </p>
              </div>
            </div>
          </Card>
          
          {/* Explicación del sistema dinámico */}
          <Card className="p-6 rounded-[2.5rem] bg-gradient-to-r from-blue-50 to-cyan-50 border-2 border-blue-100 mb-8">
            <div className="flex items-start gap-4">
              <div className="p-3 bg-white rounded-2xl">
                <RefreshCw className="text-blue-500" size={24} />
              </div>
              <div>
                <p className="text-sm font-black text-blue-700 uppercase mb-2">
                  ⚡ SISTEMA DE CÁLCULO DINÁMICO
                </p>
                <p className="text-[11px] text-slate-600 mb-3">
                  La app <span className="font-bold">recalcula en tiempo real</span> los valores óptimos basándose en:
                </p>
                <ul className="text-[10px] text-slate-600 space-y-2">
                  <li>• <span className="font-bold">Número total de plantas</span> (6-18)</li>
                  <li>• <span className="font-bold">Variedad de cada planta</span> (valores específicos)</li>
                  <li>• <span className="font-bold">Etapa de crecimiento</span> (nivel 1, 2 o 3)</li>
                  <li>• <span className="font-bold">Volumen actual de agua</span> (no solo el total)</li>
                </ul>
              </div>
            </div>
          </Card>
          
          <button
            onClick={() => {
              // Actualizar configuración con valores calculados
              setConfig(prev => ({
                ...prev,
                targetEC: initialValues.targetEC,
                targetPH: initialValues.targetPH,
                ec: initialValues.targetEC // Establecer EC actual igual a objetivo
              }));
              
              // Crear primera entrada en historial
              const initialRecord = {
                ...config,
                targetEC: initialValues.targetEC,
                targetPH: initialValues.targetPH,
                id: Date.now(),
                d: new Date().toLocaleString(),
                note: "Inicio del sistema - 6 plántulas"
              };
              
              setHistory([initialRecord, ...history]);
              setStep(3);
              setTab("overview");
              
              setTimeout(() => {
                alert("✅ Sistema iniciado con cálculo dinámico activado\n\nLa app ajustará automáticamente los valores según:\n• Crecimiento de plantas\n• Cambios en volumen\n• Rotaciones semanales");
              }, 300);
            }}
            className="w-full bg-gradient-to-r from-emerald-500 to-green-600 text-white p-9 rounded-[2.5rem] font-black uppercase text-2xl shadow-2xl hover:shadow-3xl transition-all"
          >
            Activar Sistema Inteligente
          </button>
          
          <p className="text-center text-[10px] font-bold text-slate-500 mt-8">
            Los valores se ajustarán automáticamente durante todo el cultivo
          </p>
        </Card>
      </div>
    );
  }

  // ==================== FUNCIONES DEL PANEL PRINCIPAL ====================
  
  // Alertas visuales mejoradas
  const alerts = useMemo(() => {
    const vAct = parseFloat(config.currentVol) || 0;
    const vTot = parseFloat(config.totalVol) || 20;
    const ph = parseFloat(config.ph) || 6.0;
    const ec = parseFloat(config.ec) || 0;
    const tEc = parseFloat(config.targetEC) || 1.4;
    const tPh = parseFloat(config.targetPH) || 6.0;
    const temp = parseFloat(config.temp) || 20;
    const res = [];

    // Agua baja
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

    // Temperatura
    if (temp > 28) {
      res.push({ 
        t: "¡PELIGRO TEMPERATURA!", 
        v: `${temp}°C`, 
        d: "Alto riesgo. Añadir hielo en botella YA.", 
        c: "bg-gradient-to-r from-red-700 to-pink-800 animate-pulse",
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

    // pH
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

    // EC
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
        c: "bg-gradient-to-r from-red-800 to-amber-900 animate-pulse",
        icon: <Skull className="text-white" size={28} />,
        priority: 1
      });
    }

    // Ordenar por prioridad
    return res.sort((a, b) => a.priority - b.priority);
  }, [config, lastClean]);

  // Calendario inteligente
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
      
      if (dayNumber % measureFrequency === 0) {
        type = "measure";
        label = "Medir";
      }
      
      if (dayNumber % 7 === 0) {
        type = "rotation";
        label = "Rotar";
      }
      
      if (dayNumber === daysUntilClean) {
        type = "clean";
        label = "Limpiar";
      }
      
      if (dayNumber === daysUntilClean && dayNumber % 7 === 0) {
        type = "critical";
        label = "Doble";
      }
      
      calendarDays.push({
        day: dayNumber,
        date: dayDate,
        type,
        label,
      });
    }
    
    return calendarDays;
  };

  const handleRotation = () => {
    if (confirm("¿ROTAR NIVELES?\n• Nivel 3 → Cosecha\n• Nivel 2 → Nivel 3\n• Nivel 1 → Nivel 2\n• Nuevas plántulas en Nivel 1")) {
      const withoutMature = plants.filter(p => p.l !== 3);
      const moved = withoutMature.map(p => ({ ...p, l: p.l + 1 }));
      setPlants(moved);
      setLastRot(new Date().toISOString());
      
      // El cálculo se actualizará AUTOMÁTICAMENTE gracias al useMemo
      alert("✅ Rotación completada\n\nLa EC objetivo se ha recalculado automáticamente.");
      setTab("overview");
    }
  };

  // ==================== PANEL PRINCIPAL ====================
  const calendarDays = generateCalendar();
  
  return (
    <div className="min-h-screen bg-slate-50 pb-28 text-slate-900 font-sans">
      <header className="bg-white border-b-4 p-6 flex justify-between items-center sticky top-0 z-50">
        <div>
          <h1 className="text-2xl font-black italic text-green-700 leading-none uppercase">HydroCaru v5.0</h1>
          <p className="text-[8px] font-black uppercase tracking-widest text-slate-300 italic">Cálculo Dinámico Inteligente</p>
        </div>
        <div className="flex items-center gap-3">
          <Badge className="bg-gradient-to-r from-green-500 to-emerald-600 text-white px-4 py-2 rounded-2xl font-black text-lg">
            {config.currentVol}L/{config.totalVol}L
          </Badge>
          <div className="text-right">
            <p className="text-xs font-black text-emerald-600">EC Obj: {config.targetEC}</p>
            <p className="text-[10px] text-slate-400">{plants.length} plantas</p>
          </div>
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

          {/* PESTAÑA: OVERVIEW */}
          <TabsContent value="overview" className="space-y-4">
            {/* Resumen de cálculo actual */}
            <Card className="p-6 rounded-[2.5rem] bg-gradient-to-r from-emerald-50 to-green-50 border-2 border-emerald-100">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <p className="text-[10px] font-black uppercase text-slate-400 mb-1">
                    VALORES CALCULADOS ACTUALES
                  </p>
                  <div className="flex gap-6">
                    <div>
                      <p className="text-3xl font-black italic text-emerald-700">{config.targetEC} mS/cm</p>
                      <p className="text-[9px] text-slate-500">EC objetivo</p>
                    </div>
                    <div>
                      <p className="text-3xl font-black italic text-emerald-700">{config.targetPH}</p>
                      <p className="text-[9px] text-slate-500">pH objetivo</p>
                    </div>
                  </div>
                </div>
                <div className="p-3 bg-white rounded-2xl">
                  <RefreshCw className="text-emerald-500" size={24} />
                </div>
              </div>
              <p className="text-[10px] text-slate-500">
                Basado en {plants.length} plantas ({currentOptimalValues.statistics?.seedlingCount || 0}P/
                {currentOptimalValues.statistics?.growthCount || 0}C/
                {currentOptimalValues.statistics?.matureCount || 0}M) y {config.currentVol}L
              </p>
            </Card>
            
            {/* Composición del cultivo */}
            <Card className="p-5 rounded-[2rem] bg-gradient-to-r from-slate-50 to-blue-50 border-2">
              <p className="text-[10px] font-black uppercase text-slate-400 mb-3">COMPOSICIÓN ACTUAL</p>
              <div className="flex justify-around">
                <div className="text-center">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-b from-blue-200 to-blue-300 flex items-center justify-center mx-auto mb-1">
                    <Sprout className="text-blue-700" size={24} />
                  </div>
                  <p className="text-xl font-black text-blue-700">{currentOptimalValues.statistics?.seedlingCount || 0}</p>
                  <p className="text-[9px] font-bold text-slate-600">Plántulas</p>
                </div>
                <div className="text-center">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-b from-purple-200 to-purple-300 flex items-center justify-center mx-auto mb-1">
                    <Activity className="text-purple-700" size={24} />
                  </div>
                  <p className="text-xl font-black text-purple-700">{currentOptimalValues.statistics?.growthCount || 0}</p>
                  <p className="text-[9px] font-bold text-slate-600">Crecimiento</p>
                </div>
                <div className="text-center">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-b from-green-200 to-green-300 flex items-center justify-center mx-auto mb-1">
                    <Check className="text-green-700" size={24} />
                  </div>
                  <p className="text-xl font-black text-green-700">{currentOptimalValues.statistics?.matureCount || 0}</p>
                  <p className="text-[9px] font-bold text-slate-600">Maduras</p>
                </div>
              </div>
            </Card>
            
            {/* Alertas */}
            {alerts.length > 0 ? (
              <div className="space-y-4">
                <div className="flex items-center gap-2 px-2">
                  <Bell className="text-amber-600" size={18} />
                  <p className="text-[11px] font-black uppercase text-slate-500">ALERTAS ({alerts.length})</p>
                </div>
                {alerts.map((alert, i) => (
                  <Card key={i} className={`${alert.c} text-white p-6 rounded-[2.5rem] flex items-center gap-5 border-none shadow-xl`}>
                    <div className="bg-white/20 p-3 rounded-2xl">
                      {alert.icon}
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-black uppercase opacity-90 mb-1">{alert.t}</p>
                      <p className="text-2xl font-black italic leading-none mb-1">{alert.v}</p>
                      <p className="text-[10px] font-bold opacity-80">{alert.d}</p>
                    </div>
                  </Card>
                ))}
              </div>
            ) : (
              <Card className="p-12 text-center font-black text-green-700 border-4 border-green-100 bg-gradient-to-b from-green-50 to-emerald-50 rounded-[3rem]">
                <Check className="mx-auto mb-4 bg-white rounded-full p-4 text-green-600" size={50}/>
                <p className="text-xl mb-2">SISTEMA EN EQUILIBRIO</p>
                <p className="text-[12px] font-normal text-slate-600">Todos los parámetros óptimos para {plants.length} plantas</p>
              </Card>
            )}
          </TabsContent>

          {/* PESTAÑA: MEDICIÓN */}
          <TabsContent value="measure">
            <Card className="p-8 rounded-[3rem] bg-white shadow-2xl border-2 space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[9px] font-black uppercase text-slate-400 ml-4">pH Medido</label>
                  <input type="number" step="0.1" value={config.ph} onChange={e => setConfig({...config, ph: e.target.value})} 
                    className="w-full p-5 bg-slate-50 border-4 rounded-3xl text-center text-3xl font-black" />
                </div>
                <div className="space-y-1">
                  <label className="text-[9px] font-black uppercase text-slate-400 ml-4">EC Medida</label>
                  <input type="number" step="0.1" value={config.ec} onChange={e => setConfig({...config, ec: e.target.value})} 
                    className="w-full p-5 bg-slate-50 border-4 rounded-3xl text-center text-3xl font-black" />
                </div>
                <div className="space-y-1 col-span-2">
                  <label className="text-[9px] font-black uppercase text-cyan-600 ml-4">Litros actuales</label>
                  <input type="number" value={config.currentVol} onChange={e => setConfig({...config, currentVol: e.target.value})} 
                    className="w-full p-5 bg-cyan-50 border-4 border-cyan-100 rounded-3xl text-center text-4xl font-black text-cyan-800" />
                </div>
                <div className="space-y-1 col-span-2">
                  <label className="text-[9px] font-black uppercase text-orange-600 ml-4">Temperatura °C</label>
                  <input type="number" value={config.temp} onChange={e => setConfig({...config, temp: e.target.value})} 
                    className="w-full p-5 bg-orange-50 border-4 border-orange-100 rounded-3xl text-center text-3xl font-black text-orange-800" />
                </div>
              </div>
              
              {/* Mostrar valores recomendados actuales */}
              <Card className="p-5 rounded-[2rem] bg-gradient-to-r from-emerald-50 to-green-50 border-2">
                <p className="text-[10px] font-black uppercase text-slate-400 mb-2">VALORES RECOMENDADOS ACTUALES</p>
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center p-3 bg-white rounded-2xl">
                    <p className="text-[10px] font-black text-emerald-600">EC Objetivo</p>
                    <p className="text-2xl font-black text-emerald-700">{config.targetEC} mS/cm</p>
                  </div>
                  <div className="text-center p-3 bg-white rounded-2xl">
                    <p className="text-[10px] font-black text-emerald-600">pH Objetivo</p>
                    <p className="text-2xl font-black text-emerald-700">{config.targetPH}</p>
                  </div>
                </div>
                <p className="text-[9px] text-slate-500 mt-3 text-center">
                  Calculado para {plants.length} plantas y {config.currentVol}L
                </p>
              </Card>
              
              <button onClick={() => { 
                setHistory([{...config, id: Date.now(), d: new Date().toLocaleString()}, ...history]); 
                setTab("overview");
                alert("✅ Medición registrada");
              }} className="w-full bg-gradient-to-r from-slate-800 to-slate-900 text-white p-7 rounded-[2.5rem] font-black uppercase text-xl shadow-2xl">
                Registrar Mediciones
              </button>
            </Card>
          </TabsContent>

          {/* PESTAÑA: TORRE */}
          <TabsContent value="tower" className="space-y-6">
            <button onClick={handleRotation} className="w-full p-8 rounded-[2.5rem] bg-gradient-to-r from-orange-500 to-red-500 text-white font-black flex items-center justify-center gap-4 shadow-2xl">
                <Scissors size={28}/> 
                <div className="text-left leading-none">
                  <p className="text-[10px] uppercase opacity-70 mb-1">Cosecha y Rotación</p>
                  <p className="text-xl uppercase italic">Rotar Niveles de Torre</p>
                </div>
            </button>
            
            {/* Información de cálculo */}
            <Card className="p-5 rounded-[2rem] bg-gradient-to-r from-blue-50 to-cyan-50 border-2">
              <p className="text-[10px] font-black uppercase text-slate-400 mb-2">
                ⚡ LA EC SE RECALCULARÁ AUTOMÁTICAMENTE
              </p>
              <p className="text-[11px] text-slate-600">
                Después de rotar, la EC objetivo se ajustará para la nueva composición de plantas.
              </p>
            </Card>
            
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
                      <button key={p} onClick={() => pl ? setPlants(plants.filter(x => x.id !== pl.id)) : setSelPos({l, p})} 
                        className={`aspect-square rounded-[1.8rem] flex flex-col items-center justify-center border-4 relative transition-all ${
                          pl ? `${VARIETIES[pl.v].color} border-white shadow-xl scale-110` : 'bg-white border-slate-100 text-slate-100'
                        }`}>
                        {pl ? <Sprout size={28} className="text-white" /> : <Plus size={24} />}
                        {pl && <span className="text-[7px] font-black text-white absolute bottom-1 uppercase px-1 truncate w-full text-center leading-none">{pl.v}</span>}
                      </button>
                    )
                  })}
                </div>
              </div>
            ))}
          </TabsContent>

          {/* PESTAÑA: CALENDARIO */}
          <TabsContent value="calendar" className="space-y-6">
            <Card className="p-8 rounded-[3.5rem] bg-gradient-to-br from-indigo-950 to-purple-950 text-white shadow-2xl border-4 border-indigo-900">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-black italic text-indigo-200 uppercase">Calendario Inteligente</h3>
                <Badge className="bg-white/20 text-white">
                  {plants.length} plantas
                </Badge>
              </div>
              
              <div className="grid grid-cols-5 gap-3">
                {calendarDays.map((day, i) => (
                  <div key={i} className={`relative rounded-xl p-3 text-center border-2 ${
                    day.type === 'critical' ? 'bg-gradient-to-b from-red-600 to-rose-800 border-red-400' :
                    day.type === 'clean' ? 'bg-gradient-to-b from-red-700 to-red-900 border-red-500' :
                    day.type === 'rotation' ? 'bg-gradient-to-b from-orange-600 to-amber-800 border-orange-400' :
                    day.type === 'measure' ? 'bg-gradient-to-b from-blue-600 to-blue-800 border-blue-400' :
                    'bg-white/5 border-transparent'
                  }`}>
                    <p className={`text-lg font-black ${day.type === 'normal' ? 'text-white/30' : 'text-white'}`}>
                      {day.day}
                    </p>
                    {day.label && (
                      <p className="text-[8px] font-black uppercase mt-1">{day.label}</p>
                    )}
                  </div>
                ))}
              </div>
            </Card>
          </TabsContent>

          {/* PESTAÑA: CONSEJOS */}
          <TabsContent value="tips" className="space-y-6">
            <h2 className="text-2xl font-black uppercase italic text-slate-800 ml-4">Consejos Maestros</h2>
            
            <Card className="rounded-[3rem] border-4 border-cyan-100 overflow-hidden shadow-xl bg-white">
              <div className="bg-gradient-to-r from-cyan-600 to-teal-600 p-6 text-white flex items-center gap-4">
                <RefreshCw size={30}/>
                <h3 className="font-black uppercase text-xs tracking-widest">CÁLCULO DINÁMICO EXPLICADO</h3>
              </div>
              <div className="p-8 text-[11px] font-bold text-slate-700 italic leading-relaxed space-y-4">
                <p>• <span className="text-cyan-700 uppercase font-black">EC en tiempo real:</span> La app calcula constantemente la EC ideal basándose en el número real de plantas, sus variedades, etapas y volumen actual de agua.</p>
                <p>• <span className="text-cyan-700 uppercase font-black">Protección automática:</span> Si añades nuevas plántulas, la EC se reduce automáticamente para no quemar raíces jóvenes.</p>
                <p>• <span className="text-cyan-700 uppercase font-black">Adaptación al volumen:</span> A medida que el agua disminuye, los cálculos se ajustan para mantener concentraciones seguras.</p>
                <p>• <span className="text-cyan-700 uppercase font-black">Sin intervención:</span> No necesitas recalcular nada. El sistema se adapta solo a los cambios.</p>
              </div>
            </Card>
            
            {/* Otros consejos... */}
          </TabsContent>

          {/* PESTAÑA: AJUSTES */}
          <TabsContent value="settings" className="space-y-6 py-10">
            <button onClick={() => { 
              setLastClean(new Date().toISOString()); 
              alert('✅ Limpieza registrada. Próxima en 14 días.'); 
            }} className="w-full bg-gradient-to-r from-violet-500 to-purple-600 text-white p-8 rounded-[2.5rem] font-black border-4 border-violet-200 uppercase text-sm shadow-xl">
              <ShieldAlert className="inline mr-2"/> Registrar Limpieza Completa
            </button>
            
            <button onClick={() => { 
              if(confirm('¿RESETEO COMPLETO?\n\nSe borrarán todos los datos.')) { 
                localStorage.clear(); 
                window.location.reload(); 
              }
            }} className="w-full bg-gradient-to-r from-red-500 to-rose-600 text-white p-10 rounded-[2.5rem] font-black border-4 border-red-200 uppercase text-sm shadow-xl">
              RESETEO COMPLETO DEL SISTEMA
            </button>
            
            <div className="text-center pt-10">
              <p className="text-[10px] font-black text-slate-300 uppercase italic tracking-widest">
                HydroCaru v5.0 - Cálculo Dinámico Inteligente
              </p>
              <p className="text-[9px] text-slate-400 mt-2">
                EC actual: {config.targetEC} | Plantas: {plants.length} | Agua: {config.currentVol}L
              </p>
            </div>
          </TabsContent>
        </Tabs>
      </main>

      {/* Modal para seleccionar variedad */}
      {selPos && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md flex items-end p-4 z-[9999]">
          <div className="bg-white w-full max-w-md mx-auto rounded-[4rem] p-12 space-y-4 shadow-2xl">
            <div className="flex justify-between items-center mb-4">
                <h3 className="font-black italic text-slate-400 uppercase text-sm">Seleccionar Variedad</h3>
                <button onClick={() => setSelPos(null)} className="p-2 bg-slate-100 rounded-full text-slate-400">
                  <Plus size={24} className="rotate-45"/>
                </button>
            </div>
            <div className="grid gap-3">
              {Object.keys(VARIETIES).map(v => (
                <button 
                  key={v} 
                  onClick={() => {
                    setPlants([...plants, {id: Date.now(), v, l: selPos.l, p: selPos.p}]);
                    setSelPos(null);
                    // El cálculo se actualizará AUTOMÁTICAMENTE
                  }}
                  className={`w-full p-7 rounded-[2.2rem] font-black text-white shadow-xl flex justify-between items-center ${VARIETIES[v].color}`}
                >
                  <div className="text-left">
                    <span className="text-2xl uppercase italic tracking-tighter leading-none block">{v}</span>
                    <span className="text-[10px] opacity-80 lowercase font-medium">
                      EC plántula: {VARIETIES[v].hyproDosage.seedling.ec}
                    </span>
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
