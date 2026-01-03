"use client"

import React, { useState, useEffect, useMemo } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { 
  Sprout, Activity, Layers, Beaker, Calendar, 
  Plus, Trash2, FlaskConical, ArrowDownCircle, Droplets, 
  Check, Lock, Lightbulb, Thermometer, Scissors, Clock, AlertTriangle, Info, Zap, Wind
} from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Card } from "@/components/ui/card"

const VARIETIES: { [key: string]: string } = {
  "Romana": "bg-emerald-500",
  "Iceberg": "bg-blue-400",
  "Hoja de Roble": "bg-red-500",
  "Lollo Rosso": "bg-purple-500",
  "Trocadero": "bg-lime-500"
};

export default function HydroAppV19() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isSetup, setIsSetup] = useState(false);
  const [tab, setTab] = useState("overview");
  const [plants, setPlants] = useState<any[]>([]);
  const [history, setHistory] = useState<any[]>([]);
  const [rotationDate, setRotationDate] = useState(new Date().toISOString());
  const [cleanDate, setCleanDate] = useState(new Date().toISOString());
  const [config, setConfig] = useState({ totalVol: "20", targetEC: "1.4" });
  const [current, setCurrent] = useState({ pH: "6.0", ec: "1.2", vol: "20", temp: "22" });
  const [selector, setSelector] = useState<{l: number, p: number} | null>(null);

  // Persistencia Blindada
  useEffect(() => {
    const saved = localStorage.getItem("hydro_v19_master");
    if (saved) {
      const d = JSON.parse(saved);
      setPlants(d.plants || []);
      setConfig(d.config || { totalVol: "20", targetEC: "1.4" });
      setHistory(d.history || []);
      setRotationDate(d.rotationDate || new Date().toISOString());
      setCleanDate(d.cleanDate || new Date().toISOString());
      setIsSetup(d.isSetup || false);
    }
  }, []);

  useEffect(() => {
    if (isSetup) {
      localStorage.setItem("hydro_v19_master", JSON.stringify({
        isSetup, plants, config, history, rotationDate, cleanDate
      }));
    }
  }, [isSetup, plants, config, history, rotationDate, cleanDate]);

  const diffRot = Math.floor((Date.now() - new Date(rotationDate).getTime()) / 86400000);
  const diffClean = Math.floor((Date.now() - new Date(cleanDate).getTime()) / 86400000);

  const alerts = useMemo(() => {
    const v = parseFloat(current.vol) || 0;
    const ph = parseFloat(current.pH) || 0;
    const ec = parseFloat(current.ec) || 0;
    const target = parseFloat(config.targetEC) || 1.4;
    const res = [];

    if (v > 0) {
      if (diffRot >= 7) res.push({ t: "ROTACIÓN", v: "TOCA", d: "Cosechar Nivel 3", c: "bg-orange-600 animate-pulse", i: <Clock /> });
      if (diffClean >= 30) res.push({ t: "LIMPIEZA", v: "DEPÓSITO", d: "Lavar sales", c: "bg-red-700", i: <AlertTriangle /> });
      if (ph > 6.2) res.push({ t: "pH ALTO", v: `${((ph - 6.0) * v * 1.5).toFixed(0)}ml`, d: "Añadir pH Down", c: "bg-purple-600", i: <ArrowDownCircle /> });
      if (ph < 5.6 && ph > 0) res.push({ t: "pH BAJO", v: `${((6.0 - ph) * v * 1.5).toFixed(0)}ml`, d: "Añadir pH Up", c: "bg-pink-600", i: <ArrowDownCircle className="rotate-180" /> });
      if (ec < target && ec > 0) res.push({ t: "FALTAN NUTRIENTES", v: `${(((target - ec) / 0.1) * v * 0.25).toFixed(1)}ml`, d: "Añadir A+B", c: "bg-blue-700", i: <FlaskConical /> });
    }
    return res;
  }, [current, config, diffRot, diffClean]);

  return (
    <div className="min-h-screen bg-slate-50 pb-20 text-slate-900 font-sans">
      <header className="bg-white border-b-2 p-6 flex justify-between items-center sticky top-0 z-50">
        <div className="text-2xl font-black italic text-green-700 tracking-tighter uppercase">HydroCaru <span className="text-slate-400 text-xs font-light">Master v19</span></div>
        <Badge className="bg-slate-900 text-white px-4 py-1">{current.vol}L</Badge>
      </header>

      <main className="container mx-auto p-4 max-w-md">
        <Tabs value={tab} onValueChange={setTab}>
          <TabsList className="grid grid-cols-6 bg-white border-2 shadow-xl rounded-2xl mb-8 overflow-hidden h-14">
            <TabsTrigger value="overview"><Activity size={18}/></TabsTrigger>
            <TabsTrigger value="measure"><Beaker size={18}/></TabsTrigger>
            <TabsTrigger value="tower"><Layers size={18}/></TabsTrigger>
            <TabsTrigger value="history"><Calendar size={18}/></TabsTrigger>
            <TabsTrigger value="tips"><Lightbulb size={18}/></TabsTrigger>
            <TabsTrigger value="settings"><Trash2 size={18}/></TabsTrigger>
          </TabsList>

          {/* ... PESTAÑAS ANTERIORES SE MANTIENEN IGUAL (STABLE) ... */}
          {/* Foco en la nueva Pestaña Tips */}

          <TabsContent value="tips" className="space-y-6">
            <h2 className="text-xl font-black italic text-slate-800 uppercase flex items-center gap-2">
              <Zap className="text-yellow-500" fill="currentColor"/> Manual del Maestro
            </h2>

            {/* SECCIÓN 1: LANA DE ROCA */}
            <Card className="rounded-[2.5rem] overflow-hidden border-2 border-orange-200 shadow-md">
              <div className="bg-orange-500 p-4 text-white flex items-center gap-3">
                <Layers size={24}/>
                <h3 className="font-black uppercase text-xs tracking-wider">Protocolo Lana de Roca</h3>
              </div>
              <div className="p-6 space-y-4">
                <div className="flex gap-4">
                  <div className="w-8 h-8 rounded-full bg-orange-100 text-orange-600 flex items-center justify-center font-black shrink-0">1</div>
                  <p className="text-xs font-bold leading-relaxed text-slate-600">
                    <span className="text-orange-700 uppercase">Estabilización Ácida:</span> La lana virgen tiene un pH de 8.0 (alcalino). <span className="underline">DEBES</span> sumergirla 24h en agua a pH 5.5 antes de sembrar. Si no, las raíces jóvenes se bloquearán y morirán.
                  </p>
                </div>
                <div className="flex gap-4">
                  <div className="w-8 h-8 rounded-full bg-orange-100 text-orange-600 flex items-center justify-center font-black shrink-0">2</div>
                  <p className="text-xs font-bold leading-relaxed text-slate-600">
                    <span className="text-orange-700 uppercase">Estructura de Oxígeno:</span> Al sacarla del agua, <span className="underline italic">NUNCA</span> la estrujes. Sacúdela suavemente. Si la aprietas, colapsas los micro-poros y eliminas el oxígeno, provocando asfixia radicular inmediata.
                  </p>
                </div>
              </div>
            </Card>

            {/* SECCIÓN 2: OXIGENACIÓN Y TEMPERATURA */}
            <Card className="rounded-[2.5rem] overflow-hidden border-2 border-blue-200 shadow-md">
              <div className="bg-blue-600 p-4 text-white flex items-center gap-3">
                <Wind size={24}/>
                <h3 className="font-black uppercase text-xs tracking-wider">Oxígeno y Termodinámica</h3>
              </div>
              <div className="p-6 space-y-4">
                <div className="flex items-start gap-4 p-3 bg-blue-50 rounded-2xl">
                  <Thermometer className="text-blue-600 shrink-0"/>
                  <p className="text-xs font-bold text-blue-900 leading-tight">
                    A más de 25°C, el agua pierde la capacidad física de retener oxígeno disuelto. Las raíces se vuelven marrones (podredumbre).
                  </p>
                </div>
                <div className="text-[11px] font-black text-slate-600 space-y-2">
                  <p>• <span className="text-blue-600">SOLUCIÓN VERANO:</span> Congela botellas de agua de 500ml y pon una dentro del depósito en las horas de calor.</p>
                  <p>• <span className="text-blue-600">NIVEL DE AGUA:</span> Deja que el agua caiga con fuerza desde el retorno; ese "chapoteo" es tu mejor aireador mecánico.</p>
                </div>
              </div>
            </Card>

            {/* SECCIÓN 3: NUTRICIÓN AVANZADA */}
            <Card className="rounded-[2.5rem] overflow-hidden border-2 border-emerald-200 shadow-md">
              <div className="bg-emerald-600 p-4 text-white flex items-center gap-3">
                <FlaskConical size={24}/>
                <h3 className="font-black uppercase text-xs tracking-wider">Control de Sales</h3>
              </div>
              <div className="p-6 text-[11px] font-bold text-slate-600 space-y-4">
                <div className="p-3 border-l-4 border-emerald-500 italic">
                  "El pH abre la puerta de la comida; la EC es la cantidad de comida en el plato."
                </div>
                <ul className="space-y-2 list-disc ml-4">
                  <li><span className="text-emerald-700 font-black uppercase">Puntas Quemadas:</span> Indica EC muy alta (demasiada comida). Diluye con agua pura.</li>
                  <li><span className="text-emerald-700 font-black uppercase">Limpieza de Bombas:</span> Cada 30 días, sumerge la bomba 30 min en vinagre para disolver las sales de calcio acumuladas.</li>
                </ul>
              </div>
            </Card>

            <p className="text-center text-[8px] font-black text-slate-300 uppercase tracking-[0.2em] mt-10 italic">
              Este manual sustituye cualquier versión anterior.
            </p>
          </TabsContent>

          {/* ... RESTO DE TABS (MEASURE, TOWER, ETC.) ... */}
        </Tabs>
      </main>

      {/* FOOTER NAVBAR SIMULADO PARA FLUIDEZ */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white border-t-2 h-16 flex justify-around items-center px-6 shadow-2xl z-40">
        <button onClick={() => setTab("overview")} className={tab === "overview" ? "text-green-600 scale-110" : "text-slate-400"}><Activity size={24}/></button>
        <button onClick={() => setTab("tower")} className={tab === "tower" ? "text-green-600 scale-110" : "text-slate-400"}><Layers size={24}/></button>
        <button onClick={() => setTab("tips")} className={tab === "tips" ? "text-green-600 scale-110" : "text-slate-400"}><Lightbulb size={24}/></button>
      </nav>
    </div>
  );
}
