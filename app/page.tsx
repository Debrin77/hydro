"use client"

import React, { useState, useEffect, useMemo } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { 
  Sprout, Activity, Layers, Beaker, Calendar, 
  Plus, Trash2, FlaskConical, ArrowDownCircle, Check, 
  Lock, Lightbulb, Scissors, Clock, AlertTriangle, Wind, Droplets, Thermometer, Zap, ShieldAlert, ChevronRight, Anchor
} from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Card } from "@/components/ui/card"

// --- BASE DE DATOS DE VARIEDADES (EC ESPECÍFICA) ---
const VARIETIES = {
  "Romana": { color: "bg-emerald-600", ecMin: 1.2, ecMax: 1.6, info: "EC ideal 1.4. Muy estable." },
  "Iceberg": { color: "bg-cyan-500", ecMin: 1.0, ecMax: 1.4, info: "EC ideal 1.2. Sensible al exceso de sales." },
  "Hoja de Roble": { color: "bg-red-600", ecMin: 1.4, ecMax: 1.8, info: "EC ideal 1.6. Soporta aguas duras." },
  "Lollo Rosso": { color: "bg-purple-600", ecMin: 1.4, ecMax: 1.8, info: "EC ideal 1.6. Color intenso con EC alta." },
  "Trocadero": { color: "bg-lime-600", ecMin: 1.1, ecMax: 1.5, info: "EC ideal 1.3. Evitar puntas quemadas." }
};

export default function HydroAppFinalV31() {
  const [step, setStep] = useState(0); 
  const [isReady, setIsReady] = useState(false);
  const [plants, setPlants] = useState<any[]>([]);
  const [history, setHistory] = useState<any[]>([]);
  const [lastRot, setLastRot] = useState(new Date().toISOString());
  const [lastClean, setLastClean] = useState(new Date().toISOString());
  const [config, setConfig] = useState({ 
    totalVol: "20", 
    currentVol: "20",
    ph: "6.0", 
    ec: "1.2", 
    temp: "22",
    targetEC: "1.4"
  });
  const [tab, setTab] = useState("overview");
  const [selPos, setSelPos] = useState<{l: number, p: number} | null>(null);

  useEffect(() => {
    const saved = localStorage.getItem("hydro_master_v31");
    if (saved) {
      const d = JSON.parse(saved);
      setPlants(d.plants || []);
      setConfig(d.config);
      setHistory(d.history || []);
      setLastRot(d.lastRot);
      setLastClean(d.lastClean);
      setStep(3);
      setIsReady(true);
    }
  }, []);

  useEffect(() => {
    if (step === 3) {
      localStorage.setItem("hydro_master_v31", JSON.stringify({ plants, config, history, lastRot, lastClean }));
    }
  }, [plants, config, history, lastRot, lastClean, step]);

  const alerts = useMemo(() => {
    const vAct = parseFloat(config.currentVol) || 0;
    const vTot = parseFloat(config.totalVol) || 20;
    const ph = parseFloat(config.ph) || 6.0;
    const ec = parseFloat(config.ec) || 0;
    const tEc = parseFloat(config.targetEC) || 1.4;
    const temp = parseFloat(config.temp) || 20;
    const res = [];

    if (vAct < vTot * 0.5) {
      res.push({ t: "AGUA CRÍTICA", v: `Faltan ${vTot - vAct}L`, d: "Rellenar para evitar picos de EC", c: "bg-red-600 animate-pulse", i: <Droplets size={30}/> });
    }
    if (temp > 25) {
      res.push({ t: "TEMP. ALTA", v: `${temp}°C`, d: "PELIGRO: Sin oxígeno. Añadir hielo al tanque.", c: "bg-orange-600 animate-bounce", i: <Thermometer size={30}/> });
    }
    if (ph > 6.2) {
      const ml = ((ph - 6.0) * 10 * vAct * 0.15).toFixed(1);
      res.push({ t: "BAJAR pH", v: `${ml}ml pH-`, d: "Bloqueo de Hierro y Magnesio", c: "bg-purple-600", i: <ArrowDownCircle /> });
    } else if (ph < 5.6 && ph > 0) {
      const ml = ((6.0 - ph) * 10 * vAct * 0.15).toFixed(1);
      res.push({ t: "SUBIR pH", v: `${ml}ml pH+`, d: "Riesgo de toxicidad por Aluminio", c: "bg-pink-600", i: <ArrowDownCircle className="rotate-180" /> });
    }
    if (ec < tEc && ec > 0) {
      const ml = (((tEc - ec) / 0.1) * vAct * 0.25).toFixed(1);
      res.push({ t: "FALTAN SALES", v: `${ml}ml A+B`, d: `Ajuste para llegar a ${tEc} mS/cm`, c: "bg-blue-700", i: <FlaskConical /> });
    } else if (ec > tEc + 0.3) {
      res.push({ t: "EC ALTA", v: "DILUIR", d: "Añadir agua sola para bajar concentración", c: "bg-amber-600", i: <AlertTriangle /> });
    }
    return res;
  }, [config]);

  const handleRotation = () => {
    if (confirm("¿Confirmas cosecha de N3 y bajada de niveles?")) {
      const filtered = plants.filter(p => p.l !== 3);
      const moved = filtered.map(p => ({ ...p, l: p.l + 1 }));
      setPlants(moved);
      setLastRot(new Date().toISOString());
      setTab("tower");
    }
  };

  if (step === 0) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center p-6">
        <Card className="w-full max-w-xs p-10 bg-white rounded-[3rem] text-center border-b-8 border-green-600 shadow-2xl">
          <Lock className="mx-auto mb-6 text-green-600" size={40} />
          <h2 className="font-black mb-6 uppercase italic tracking-tighter text-slate-400">Acceso Maestro</h2>
          <input type="password" placeholder="PIN" className="w-full text-center text-4xl font-black bg-slate-100 rounded-2xl p-4 outline-none border-2 focus:border-green-600 transition-all text-slate-900" 
            onChange={e => e.target.value === "1234" && setStep(1)} />
        </Card>
      </div>
    );
  }

  if (step === 1) {
    return (
      <div className="min-h-screen bg-slate-100 flex items-center justify-center p-4">
        <Card className="w-full max-w-md p-10 bg-white rounded-[3.5rem] shadow-2xl">
          <h2 className="text-3xl font-black text-center mb-8 uppercase italic text-blue-700">Paso 1: Depósito</h2>
          <div className="space-y-6">
            <p className="text-center text-xs font-bold text-slate-400">Capacidad TOTAL del depósito (Litros)</p>
            <input type="number" value={config.totalVol} onChange={e => setConfig({...config, totalVol: e.target.value, currentVol: e.target.value})} className="w-full p-8 bg-slate-50 border-4 rounded-3xl text-5xl font-black text-center text-slate-900" />
            <button onClick={() => setStep(2)} className="w-full bg-slate-900 text-white p-6 rounded-[2rem] font-black uppercase text-xl flex items-center justify-center gap-2">Siguiente <ChevronRight/></button>
          </div>
        </Card>
      </div>
    );
  }

  if (step === 2) {
    return (
      <div className="min-h-screen bg-slate-100 flex items-center justify-center p-4">
        <Card className="w-full max-w-md p-10 bg-white rounded-[3.5rem] shadow-2xl">
          <h2 className="text-3xl font-black text-center mb-8 uppercase italic text-purple-700">Paso 2: Nutrición</h2>
          <div className="space-y-6">
            <p className="text-center text-xs font-bold text-slate-400">EC Objetivo deseada (Recomendado: 1.4)</p>
            <input type="number" step="0.1" value={config.targetEC} onChange={e => setConfig({...config, targetEC: e.target.value})} className="w-full p-8 bg-slate-50 border-4 rounded-3xl text-5xl font-black text-center text-slate-900" />
            <button onClick={() => { setStep(3); setIsReady(true); }} className="w-full bg-blue-600 text-white p-6 rounded-[2rem] font-black uppercase text-xl shadow-xl">Iniciar Sistema</button>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 pb-28 text-slate-900 font-sans">
      <header className="bg-white border-b-4 p-6 flex justify-between items-center sticky top-0 z-50">
        <div>
          <h1 className="text-2xl font-black italic text-green-700 leading-none uppercase">HydroCaru v3.1</h1>
          <p className="text-[8px] font-black uppercase tracking-widest text-slate-300 italic">Advanced Precision Tower</p>
        </div>
        <Badge className="bg-slate-900 text-white px-5 py-2 rounded-2xl font-black text-xl">{config.currentVol}L</Badge>
      </header>

      <main className="container mx-auto p-4 max-w-md">
        <Tabs value={tab} onValueChange={setTab}>
          <TabsList className="grid grid-cols-6 bg-white border-4 border-slate-100 shadow-xl rounded-[2.5rem] mb-8 h-18 p-1">
            <TabsTrigger value="overview"><Activity /></TabsTrigger>
            <TabsTrigger value="measure"><Beaker /></TabsTrigger>
            <TabsTrigger value="tower"><Layers /></TabsTrigger>
            <TabsTrigger value="history"><Calendar /></TabsTrigger>
            <TabsTrigger value="tips"><Lightbulb /></TabsTrigger>
            <TabsTrigger value="settings"><Trash2 /></TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-4">
            {alerts.map((a, i) => (
              <Card key={i} className={`${a.c} text-white p-6 rounded-[2.5rem] flex items-center gap-5 border-none shadow-xl animate-in slide-in-from-right`}>
                <div className="bg-white/20 p-4 rounded-2xl">{a.i}</div>
                <div>
                  <p className="text-[10px] font-black uppercase opacity-70 mb-1">{a.t}</p>
                  <p className="text-2xl font-black italic leading-none">{a.v}</p>
                  <p className="text-[9px] font-bold mt-1 uppercase tracking-tighter leading-none">{a.d}</p>
                </div>
              </Card>
            ))}
            {alerts.length === 0 && (
              <Card className="p-12 text-center font-black text-green-700 border-4 border-green-100 bg-green-50 rounded-[3rem]">
                <Check className="mx-auto mb-4 bg-white rounded-full p-4 text-green-600 shadow-md" size={40}/>
                SISTEMA EN EQUILIBRIO PERFECTO
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
              <button onClick={() => { setHistory([{...config, id: Date.now(), d: new Date().toLocaleString()}, ...history]); setTab("overview"); }} className="w-full bg-slate-900 text-white p-7 rounded-[2.5rem] font-black uppercase text-xl shadow-2xl">Registrar Mediciones</button>
            </Card>
          </TabsContent>

          <TabsContent value="tower" className="space-y-6">
            <button onClick={handleRotation} className="w-full p-8 rounded-[2.5rem] bg-orange-600 text-white font-black flex items-center justify-center gap-4 shadow-2xl border-b-8 border-orange-800 active:border-b-0 active:translate-y-1 transition-all">
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
                      <button key={p} onClick={() => pl ? setPlants(plants.filter(x => x.id !== pl.id)) : setSelPos({l, p})} className={`aspect-square rounded-[1.8rem] flex flex-col items-center justify-center border-4 relative transition-all ${pl ? `${VARIETIES[pl.v].color} border-white shadow-xl scale-110` : 'bg-white border-slate-100 text-slate-100'}`}>
                        {pl ? <Sprout size={28} className="text-white" /> : <Plus size={24} />}
                        {pl && <span className="text-[7px] font-black text-white absolute bottom-1 uppercase px-1 truncate w-full text-center leading-none">{pl.v}</span>}
                      </button>
                    )
                  })}
                </div>
              </div>
            ))}
          </TabsContent>

          <TabsContent value="history" className="space-y-6">
            <Card className="p-8 rounded-[3.5rem] bg-indigo-950 text-white shadow-2xl relative overflow-hidden border-4 border-indigo-900">
              <h3 className="text-xs font-black italic mb-6 text-indigo-300 uppercase underline decoration-green-500 decoration-4">Plan de Mantenimiento (15 Días)</h3>
              <div className="grid grid-cols-5 gap-2 text-center text-[10px]">
                {Array.from({length: 15}).map((_, i) => {
                  const day = i + 1;
                  const isMed = day % 3 === 0; 
                  const isRot = day % 7 === 0; 
                  const isLim = day === 15;
                  return (
                    <div key={i} className={`h-12 flex items-center justify-center rounded-xl font-black border-2 ${isLim ? 'bg-red-500 border-red-300 animate-pulse' : isRot ? 'bg-orange-500 border-orange-300 shadow-lg shadow-orange-900/40' : isMed ? 'bg-blue-600 border-blue-300' : 'bg-white/5 border-transparent opacity-20'}`}>{day}</div>
                  )
                })}
              </div>
              <div className="mt-8 flex justify-between text-[8px] font-black uppercase opacity-60">
                 <div className="flex items-center gap-1.5"><div className="w-3 h-3 bg-blue-600 rounded"></div> Medir</div>
                 <div className="flex items-center gap-1.5"><div className="w-3 h-3 bg-orange-500 rounded"></div> Rotar</div>
                 <div className="flex items-center gap-1.5"><div className="w-3 h-3 bg-red-500 rounded text-red-500 animate-pulse shadow-sm shadow-red-500"></div> Limpiar</div>
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
            
            <Card className="rounded-[3rem] border-4 border-emerald-100 overflow-hidden shadow-xl bg-white">
              <div className="bg-emerald-600 p-6 text-white flex items-center gap-4"><Sprout size={30}/><h3 className="font-black uppercase text-xs tracking-widest">Manejo de Plántulas</h3></div>
              <div className="p-8 text-[11px] font-bold text-slate-700 italic leading-relaxed space-y-4">
                <p>• <span className="text-emerald-700 uppercase font-black">Luz Inicial:</span> Una vez germinen, necesitan 16-18h de luz. Si el tallo se estira mucho (ahilado), acerca la luz; la planta busca energía y gasta reservas vitales.</p>
                <p>• <span className="text-emerald-700 uppercase font-black">Primeros Nutrientes:</span> No uses EC alta al nacer. Empieza con 0.6 - 0.8 mS/cm. La raíz joven es extremadamente sensible y una dosis alta de sales la deshidratará (plasmólisis).</p>
                <p>• <span className="text-emerald-700 uppercase font-black">Humedad:</span> Mantén el entorno al 70-80% las primeras 2 semanas para que la hoja no transpire más de lo que la raíz puede absorber.</p>
              </div>
            </Card>

            <Card className="rounded-[3rem] border-4 border-orange-100 overflow-hidden shadow-xl bg-white">
              <div className="bg-orange-500 p-6 text-white flex items-center gap-4"><Layers size={30}/><h3 className="font-black uppercase text-xs tracking-widest">Lana de Roca: Guía Técnica</h3></div>
              <div className="p-8 text-[11px] font-bold text-slate-700 italic leading-relaxed space-y-4">
                <p>• <span className="text-orange-600 uppercase font-black">Neutralizado Pro:</span> La lana es roca fundida y es alcalina (pH 8+). Sumerge en agua con pH 5.2-5.5 durante 24h. Esto estabiliza los silicatos y permite que el fósforo esté disponible desde el minuto 1.</p>
                <p>• <span className="text-orange-600 uppercase font-black">Drenaje Maestro:</span> Tras el remojo, deja que escurra por gravedad. **PROHIBIDO ESTRUJAR**. Al apretarla, destruyes el 50% de los microporos de aire. La lana de roca debe tener un ratio 60% agua / 40% aire para evitar la pudrición radicular.</p>
              </div>
            </Card>

            <Card className="rounded-[3rem] border-4 border-blue-100 overflow-hidden shadow-xl bg-white">
              <div className="bg-blue-600 p-6 text-white flex items-center gap-4"><Anchor size={30}/><h3 className="font-black uppercase text-xs tracking-widest">Estabilidad del Depósito</h3></div>
              <div className="p-8 text-[11px] font-bold text-slate-700 italic leading-relaxed space-y-4">
                <p>• <span className="text-blue-700 uppercase font-black">Orden de Mezcla:</span> Primero regula el pH del agua sola, luego añade Nutriente A, mezcla bien, y luego Nutriente B. Si mezclas A y B puros, los minerales precipitan y se vuelven piedras insolubles.</p>
                <p>• <span className="text-blue-700 uppercase font-black">Bio-Film:</span> Si el agua huele a pantano, limpia el depósito con agua oxigenada al 3% para desinfectar las paredes antes de volver a llenar.</p>
              </div>
            </Card>
          </TabsContent>

          <TabsContent value="settings" className="space-y-6 py-10">
            <button onClick={() => { setLastClean(new Date().toISOString()); alert('Limpieza registrada.'); }} className="w-full bg-slate-100 text-slate-800 p-8 rounded-[2.5rem] font-black border-4 border-slate-200 uppercase text-xs flex items-center justify-center gap-2"><ShieldAlert className="text-red-500"/> Registrar Limpieza de sales hoy</button>
            <button onClick={() => { if(confirm('¿BORRAR TODO?')) { localStorage.clear(); window.location.reload(); }}} className="w-full bg-red-100 text-red-600 p-10 rounded-[2.5rem] font-black border-4 border-red-200 uppercase text-sm shadow-xl hover:bg-red-600 hover:text-white transition-all">RESETEO MAESTRO</button>
            <p className="text-center text-[10px] font-black text-slate-300 uppercase italic tracking-widest pt-10 leading-relaxed">HydroCaru Master v.3.1<br/>Clean Cycle Optimized: 15 Days</p>
          </TabsContent>
        </Tabs>
      </main>

      {selPos && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md flex items-end p-4 z-[9999]">
          <div className="bg-white w-full max-w-md mx-auto rounded-[4rem] p-12 space-y-4 shadow-2xl animate-in slide-in-from-bottom duration-300">
            <div className="flex justify-between items-center mb-4">
                <h3 className="font-black italic text-slate-400 uppercase text-sm">Seleccionar Variedad</h3>
                <button onClick={() => setSelPos(null)} className="p-2 bg-slate-100 rounded-full text-slate-400"><Plus size={24} className="rotate-45"/></button>
            </div>
            <div className="grid gap-3">
              {Object.keys(VARIETIES).map(v => (
                <button key={v} onClick={() => {setPlants([...plants, {id: Date.now(), v, l: selPos.l, p: selPos.p}]); setSelPos(null);}} className={`w-full p-7 rounded-[2.2rem] font-black text-white shadow-xl flex justify-between items-center hover:scale-105 active:scale-95 transition-all ${VARIETIES[v].color}`}>
                    <div className="text-left">
                        <span className="text-2xl uppercase italic tracking-tighter leading-none block">{v}</span>
                        <span className="text-[10px] opacity-80 lowercase font-medium">Rango: {VARIETIES[v].ecMin}-{VARIETIES[v].ecMax} EC</span>
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
