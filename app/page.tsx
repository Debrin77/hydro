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

// ==================== FUNCIÓN PARA CALCULAR EC INICIAL ====================
const calculateInitialEC = (plants, totalVolume) => {
  // Para el inicio: todas las plantas son plántulas (nivel 1)
  if (plants.length === 0) return { targetEC: "0.8", targetPH: "6.0" };
  
  let totalEC = 0;
  let totalPH = 0;
  
  plants.forEach(plant => {
    const variety = VARIETIES[plant.v];
    if (!variety) return;
    
    // Solo usamos el valor de plántula (seedling) para el inicio
    totalEC += variety.hyproDosage.seedling.ec;
    totalPH += variety.phIdeal;
  });
  
  // Promedio de EC para plántulas
  let avgEC = totalEC / plants.length;
  
  // Ajuste adicional para plántulas: reducir 15% para mayor seguridad
  avgEC *= 0.85;
  
  // Limitar a rango seguro para plántulas
  avgEC = Math.max(0.5, Math.min(1.2, avgEC));
  
  return {
    targetEC: avgEC.toFixed(2),
    targetPH: (totalPH / plants.length).toFixed(1),
    plantCount: plants.length
  };
};

// ==================== COMPONENTE PRINCIPAL ====================
export default function HydroAppFinalV31() {
  const [step, setStep] = useState(0); // 0=Volumen, 1=Selección, 2=Resumen, 3=Panel
  const [plants, setPlants] = useState([]);
  const [history, setHistory] = useState([]);
  const [lastRot, setLastRot] = useState(new Date().toISOString());
  const [lastClean, setLastClean] = useState(new Date().toISOString());
  const [config, setConfig] = useState({ 
    totalVol: "20", 
    currentVol: "20",  // Inicia lleno
    ph: "6.0", 
    ec: "1.2", 
    temp: "22",
    targetEC: "1.4", 
    targetPH: "6.0"
  });
  const [tab, setTab] = useState("overview");
  const [selPos, setSelPos] = useState(null);

  // Cálculo en vivo del EC inicial
  const initialCalculation = useMemo(() => {
    return calculateInitialEC(plants.filter(p => p.l === 1), parseFloat(config.totalVol));
  }, [plants, config.totalVol]);

  // Cargar datos guardados
  useEffect(() => {
    const saved = localStorage.getItem("hydro_master_v31");
    if (saved) {
      const d = JSON.parse(saved);
      setPlants(d.plants || []);
      setConfig(d.config || config);
      setHistory(d.history || []);
      setLastRot(d.lastRot);
      setLasClean(d.lastClean);
      setStep(3); // Saltar al panel si ya hay datos
    }
  }, []);

  // Guardar automáticamente
  useEffect(() => {
    if (step >= 2) {
      localStorage.setItem("hydro_master_v31", 
        JSON.stringify({ plants, config, history, lastRot, lastClean }));
    }
  }, [plants, config, history, lastRot, lastClean, step]);

  // ==================== PANTALLA 1: VOLUMEN DEL DEPÓSITO ====================
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
            <h2 className="text-2xl font-black mb-4 text-cyan-700">PASO 1: VOLUMEN DEL DEPÓSITO</h2>
            <p className="text-sm font-bold mb-6 text-slate-500">Capacidad total de agua (Litros)</p>
            
            <div className="relative">
              <input 
                type="number" 
                value={config.totalVol} 
                onChange={e => setConfig({
                  ...config, 
                  totalVol: e.target.value, 
                  currentVol: e.target.value  // Lleno al inicio
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
            
            <div className="mt-6 grid grid-cols-3 gap-3">
              {[10, 20, 30, 40, 50, 60].map(vol => (
                <button
                  key={vol}
                  onClick={() => setConfig({
                    ...config, 
                    totalVol: vol.toString(), 
                    currentVol: vol.toString()
                  })}
                  className={`p-4 rounded-2xl font-black ${config.totalVol === vol.toString() 
                    ? 'bg-cyan-500 text-white shadow-lg' 
                    : 'bg-slate-100 text-slate-400'}`}
                >
                  {vol}L
                </button>
              ))}
            </div>
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
          {/* Encabezado */}
          <div className="flex items-center justify-between mb-10">
            <button 
              onClick={() => setStep(0)} 
              className="p-3 bg-slate-100 rounded-full hover:bg-slate-200 transition-colors"
            >
              <ArrowLeft className="text-slate-500" size={24} />
            </button>
            
            <div className="text-center">
              <h2 className="text-2xl font-black uppercase italic text-emerald-700">PASO 2: TU TORRE</h2>
              <p className="text-sm font-bold text-slate-400">Selecciona 6 plántulas para el Nivel 1</p>
            </div>
            
            <div className="w-12"></div>
          </div>
          
          {/* Indicador de progreso */}
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
          
          {/* Torre de cultivo visual */}
          <div className="mb-10">
            <div className="bg-gradient-to-b from-emerald-100 to-green-50 p-8 rounded-[3rem] border-4 border-emerald-200 shadow-inner">
              <div className="text-center mb-6">
                <div className="inline-flex items-center gap-2 bg-white px-4 py-2 rounded-full shadow">
                  <Layers className="text-emerald-600" size={18} />
                  <span className="text-sm font-black text-emerald-700 uppercase">Nivel 1 - Plántulas</span>
                </div>
              </div>
              
              <div className="grid grid-cols-3 gap-5">
                {[1, 2, 3, 4, 5, 6].map(position => {
                  const plant = plants.find(p => p.l === 1 && p.p === position);
                  
                  return (
                    <button
                      key={position}
                      onClick={() => {
                        if (plant) {
                          // Eliminar planta existente
                          setPlants(plants.filter(p => p.id !== plant.id));
                        } else if (level1Plants.length < 6) {
                          // Abrir selector si hay espacio
                          setSelPos({ l: 1, p: position });
                        } else {
                          alert("Ya tienes 6 plántulas seleccionadas. Elimina una primero.");
                        }
                      }}
                      className={`aspect-square rounded-[2rem] flex flex-col items-center justify-center border-4 relative transition-all duration-200 ${
                        plant 
                          ? `${VARIETIES[plant.v].color} border-white shadow-xl scale-105` 
                          : 'bg-gradient-to-b from-white to-slate-50 border-emerald-100 hover:border-emerald-300'
                      }`}
                    >
                      {plant ? (
                        <>
                          <Leaf className="text-white" size={32} />
                          <span className="text-[9px] font-black text-white absolute bottom-2 uppercase px-2 truncate w-full text-center">
                            {plant.v}
                          </span>
                          {/* Indicador de eliminación */}
                          <div className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 rounded-full flex items-center justify-center">
                            <Trash2 className="text-white" size={12} />
                          </div>
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
            
            {/* EC calculado en tiempo real */}
            {level1Plants.length > 0 && (
              <Card className="mt-6 p-6 rounded-[2.5rem] bg-gradient-to-r from-blue-50 to-cyan-50 border-2 border-blue-100">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-[11px] font-black uppercase text-slate-400 mb-1">
                      EC RECOMENDADA (Cálculo en vivo)
                    </p>
                    <p className="text-4xl font-black italic text-blue-700 leading-none">
                      {initialCalculation.targetEC} mS/cm
                    </p>
                    <p className="text-[10px] font-bold text-slate-500 mt-1">
                      Para {level1Plants.length} plántulas en depósito de {config.totalVol}L
                    </p>
                  </div>
                  <div className="p-3 bg-white rounded-2xl shadow">
                    <Activity className="text-blue-500" size={32} />
                  </div>
                </div>
              </Card>
            )}
          </div>
          
          {/* Botón de continuar */}
          <button
            onClick={() => {
              if (level1Plants.length === 6) {
                // Actualizar configuración con EC calculada
                setConfig(prev => ({
                  ...prev,
                  targetEC: initialCalculation.targetEC,
                  targetPH: initialCalculation.targetPH,
                  ec: initialCalculation.targetEC // Establecer EC inicial igual a objetivo
                }));
                setStep(2);
              } else {
                alert(`Necesitas seleccionar 6 plántulas. Tienes ${level1Plants.length}/6.`);
              }
            }}
            disabled={level1Plants.length !== 6}
            className={`w-full p-8 rounded-[2.5rem] font-black uppercase text-xl shadow-2xl flex items-center justify-center gap-3 transition-all ${
              level1Plants.length === 6
                ? 'bg-gradient-to-r from-emerald-500 to-green-600 text-white hover:shadow-3xl'
                : 'bg-slate-100 text-slate-400 cursor-not-allowed'
            }`}
          >
            {level1Plants.length === 6 ? (
              <>
                <span>Ver Resumen Final</span>
                <ArrowRight size={24} />
              </>
            ) : (
              `Selecciona ${6 - level1Plants.length} más`
            )}
          </button>
          
          {/* Lista de variedades seleccionadas */}
          {level1Plants.length > 0 && (
            <div className="mt-8">
              <p className="text-xs font-black text-slate-400 mb-3 uppercase">Tus plántulas seleccionadas:</p>
              <div className="flex flex-wrap gap-2">
                {level1Plants.map(plant => (
                  <Badge 
                    key={plant.id} 
                    className={`${VARIETIES[plant.v].color} text-white px-4 py-2 rounded-full text-sm font-black flex items-center gap-2`}
                  >
                    <Sprout size={14} />
                    {plant.v}
                  </Badge>
                ))}
              </div>
            </div>
          )}
        </Card>
      </div>
    );
  }

  // ==================== PANTALLA 3: RESUMEN Y CONFIRMACIÓN ====================
  if (step === 2) {
    const level1Plants = plants.filter(p => p.l === 1);
    const totalVolume = parseFloat(config.totalVol);
    
    // Calcular dosificación Hy-Pro para plántulas
    let totalA = 0, totalB = 0;
    level1Plants.forEach(plant => {
      const variety = VARIETIES[plant.v];
      if (variety) {
        // Dosis para plántulas en todo el volumen
        const dosagePerLiter = variety.hyproDosage.seedling.a / 10; // ml por litro
        totalA += dosagePerLiter * totalVolume / level1Plants.length;
        totalB += dosagePerLiter * totalVolume / level1Plants.length;
      }
    });
    
    // Ajustar según EC objetivo
    const ecRatio = parseFloat(initialCalculation.targetEC) / 1.4;
    totalA *= ecRatio;
    totalB *= ecRatio;
    
    const hyproDosage = {
      a: Math.round(totalA),
      b: Math.round(totalB),
      per10L: {
        a: Math.round((totalA * 10) / totalVolume),
        b: Math.round((totalB * 10) / totalVolume)
      }
    };
    
    return (
      <div className="min-h-screen bg-gradient-to-b from-amber-50 to-orange-100 flex items-center justify-center p-4">
        <Card className="w-full max-w-md p-12 bg-white rounded-[4rem] shadow-2xl">
          {/* Encabezado */}
          <div className="text-center mb-10">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-r from-green-400 to-emerald-500 rounded-full mb-6 shadow-lg">
              <Check className="text-white" size={36} />
            </div>
            
            <h2 className="text-3xl font-black uppercase italic text-emerald-700 mb-3">
              ¡Configuración Completa!
            </h2>
            <p className="text-sm font-bold text-slate-400">
              Tu sistema está listo para comenzar
            </p>
          </div>
          
          {/* Resumen del sistema */}
          <div className="space-y-6 mb-12">
            {/* EC Final Calculada */}
            <Card className="p-8 rounded-[3rem] bg-gradient-to-r from-emerald-50 to-green-50 border-2 border-emerald-100">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <p className="text-[12px] font-black uppercase text-slate-400 mb-1">
                    EC ÓPTIMA CALCULADA
                  </p>
                  <p className="text-5xl font-black italic text-emerald-700 leading-none">
                    {initialCalculation.targetEC} mS/cm
                  </p>
                  <p className="text-[11px] font-bold text-slate-500 mt-2">
                    Para 6 plántulas en depósito de {config.totalVol}L lleno
                  </p>
                </div>
                <div className="p-4 bg-white rounded-2xl shadow">
                  <FlaskConical className="text-emerald-600" size={40} />
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 bg-white rounded-2xl text-center">
                  <p className="text-[10px] font-black text-emerald-600 uppercase">pH Objetivo</p>
                  <p className="text-3xl font-black text-emerald-700">{initialCalculation.targetPH}</p>
                </div>
                <div className="p-4 bg-white rounded-2xl text-center">
                  <p className="text-[10px] font-black text-emerald-600 uppercase">Volumen</p>
                  <p className="text-3xl font-black text-emerald-700">{config.totalVol}L</p>
                </div>
              </div>
            </Card>
            
            {/* Dosificación Hy-Pro */}
            <Card className="p-8 rounded-[3rem] bg-gradient-to-r from-cyan-50 to-blue-50 border-2 border-cyan-100">
              <div className="text-center mb-6">
                <div className="inline-flex items-center gap-3 bg-white px-5 py-3 rounded-full shadow mb-4">
                  <FlaskConical className="text-cyan-600" size={20} />
                  <p className="text-sm font-black text-cyan-700 uppercase">DOSIS HY-PRO A/B</p>
                </div>
                <p className="text-[11px] font-bold text-slate-500">
                  Para llenar todo el depósito de {config.totalVol}L
                </p>
              </div>
              
              <div className="grid grid-cols-2 gap-5 mb-6">
                <div className="text-center p-6 bg-white rounded-[2rem] border-2 border-cyan-200 shadow-lg">
                  <p className="text-[11px] font-black uppercase text-cyan-600 mb-2">Nutriente A</p>
                  <p className="text-4xl font-black text-cyan-700">{hyproDosage.a} ml</p>
                  <p className="text-[10px] text-slate-500 mt-2">
                    ({hyproDosage.per10L.a} ml por cada 10L)
                  </p>
                </div>
                <div className="text-center p-6 bg-white rounded-[2rem] border-2 border-blue-200 shadow-lg">
                  <p className="text-[11px] font-black uppercase text-blue-600 mb-2">Nutriente B</p>
                  <p className="text-4xl font-black text-blue-700">{hyproDosage.b} ml</p>
                  <p className="text-[10px] text-slate-500 mt-2">
                    ({hyproDosage.per10L.b} ml por cada 10L)
                  </p>
                </div>
              </div>
              
              <div className="bg-white/80 p-4 rounded-2xl">
                <p className="text-[10px] font-black text-cyan-700 uppercase mb-2">
                  📋 Instrucciones de mezcla para el inicio:
                </p>
                <ol className="text-[10px] text-slate-600 space-y-2 pl-4">
                  <li>1. Llena el depósito con <span className="font-black">{config.totalVol}L</span> de agua</li>
                  <li>2. Añadir <span className="font-black text-cyan-700">{hyproDosage.a}ml</span> de Hy-Pro A y mezclar 1 minuto</li>
                  <li>3. Añadir <span className="font-black text-blue-700">{hyproDosage.b}ml</span> de Hy-Pro B y mezclar 2 minutos</li>
                  <li>4. Ajustar pH a <span className="font-black">{initialCalculation.targetPH}</span> si es necesario</li>
                  <li>5. ¡Sistema listo! EC objetivo: <span className="font-black">{initialCalculation.targetEC}</span></li>
                </ol>
              </div>
            </Card>
            
            {/* Resumen de variedades */}
            <Card className="p-6 rounded-[2.5rem] bg-gradient-to-r from-slate-50 to-slate-100 border-2">
              <p className="text-xs font-black text-slate-400 mb-4 uppercase">
                🌱 Tus 6 plántulas iniciales:
              </p>
              <div className="grid grid-cols-2 gap-3">
                {level1Plants.map((plant, index) => {
                  const variety = VARIETIES[plant.v];
                  return (
                    <div 
                      key={plant.id} 
                      className={`p-4 rounded-2xl text-white flex items-center justify-between ${variety.color}`}
                    >
                      <div>
                        <p className="text-sm font-black uppercase">{plant.v}</p>
                        <p className="text-[10px] opacity-80">
                          EC plántula: {variety.hyproDosage.seedling.ec}
                        </p>
                      </div>
                      <div className="text-2xl font-black">#{index + 1}</div>
                    </div>
                  );
                })}
              </div>
            </Card>
          </div>
          
          {/* Botón para iniciar sistema */}
          <button
            onClick={() => {
              // Crear primera entrada en el historial
              const initialRecord = {
                ...config,
                id: Date.now(),
                d: new Date().toLocaleString(),
                note: "Inicio del sistema - 6 plántulas",
                targetEC: initialCalculation.targetEC,
                targetPH: initialCalculation.targetPH
              };
              
              setHistory([initialRecord, ...history]);
              setStep(3); // Ir al panel principal
              setTab("overview");
              
              // Pequeña alerta de confirmación
              setTimeout(() => {
                alert("🎉 ¡Sistema iniciado correctamente!\n\nAhora puedes:\n1. Ver las alertas del sistema\n2. Registrar tu primera medición\n3. Consultar el calendario de tareas");
              }, 300);
            }}
            className="w-full bg-gradient-to-r from-emerald-500 to-green-600 text-white p-9 rounded-[2.5rem] font-black uppercase text-2xl shadow-2xl hover:shadow-3xl transition-all"
          >
            Iniciar Sistema de Cultivo
          </button>
          
          <p className="text-center text-[10px] font-bold text-slate-400 mt-8">
            Presiona el botón para comenzar el seguimiento diario
          </p>
        </Card>
      </div>
    );
  }

  // ==================== PANEL PRINCIPAL (IGUAL QUE ANTES) ====================
  // [NOTA: Aquí iría TODO el código del panel principal que ya tenías]
  // Desde el "return ( <div className="min-h-screen bg-slate-50 pb-28..." 
  // hasta el final del archivo anterior
  
  // Como el código es muy largo, aquí solo pongo el inicio del panel.
  // Necesitarás COPIAR Y PEGAR el panel principal completo de tu versión anterior aquí:
  
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
          {/* Resto del header... */}
        </div>
      </header>

      {/* 
        IMPORTANTE: Aquí necesitas COPIAR TODO el contenido del panel principal 
        de la versión anterior (desde <main className="container mx-auto p-4 max-w-md"> 
        hasta el final del archivo).
        
        Esto incluye:
        1. Las pestañas (Tabs)
        2. El contenido de cada pestaña (overview, measure, tower, calendar, tips, settings)
        3. El modal de selección de variedades
        4. Las funciones handleRotation, alerts, generateCalendar, etc.
        
        Para ahorrar espacio en esta respuesta, no lo copio completo nuevamente,
        pero DEBES PEGAR aquí todo ese código.
      */}
      
      <main className="container mx-auto p-4 max-w-md">
        {/* ... PEGA AQUÍ TODO EL CÓDIGO DEL PANEL PRINCIPAL ... */}
      </main>
    </div>
  );
}
