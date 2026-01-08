"use client"

import React, { useState, useMemo } from 'react'
import { Calculator, Droplets, FlaskConical, Beaker, AlertTriangle } from 'lucide-react'
import { Card } from "@/components/ui/card"

const WATER_PROFILES = {
  bezoya: {
    name: "Agua Bezoya",
    ca: 6.32,
    mg: 0.83,
    na: 1.21,
    baseEC: 0.04,
    note: "Base ideal. No requiere suplementos."
  },
  osmosis_red: {
    name: "Tu Ósmosis de Red",
    ca: 47,
    mg: 9,
    na: 11,
    baseEC: 0.30,
    note: "Requiere suplemento de Magnesio y ajuste de dosis."
  }
}

const GROWTH_STAGES = {
  seedling: { name: "Plántula / Enraizamiento", ecTarget: [0.4, 0.8], desc: "Raíces jóvenes muy sensibles." },
  vegetative: { name: "Crecimiento Vegetativo", ecTarget: [0.8, 1.4], desc: "Crecimiento activo de hojas." },
  mature: { name: "Maduración / Final", ecTarget: [1.4, 1.8], desc: "Máximo desarrollo antes de cosecha." }
}

const HYPRO_STRENGTH = 1.9

export default function hydrocalc() {
  const [waterType, setWaterType] = useState('bezoya')
  const [stage, setStage] = useState('seedling')
  const [volume, setVolume] = useState(20)
  const [targetEC, setTargetEC] = useState(0.6)

  const calculations = useMemo(() => {
    const water = WATER_PROFILES[waterType]
    const stageData = GROWTH_STAGES[stage]
    
    const safeTargetEC = Math.max(stageData.ecTarget[0], Math.min(targetEC, stageData.ecTarget[1]))
    const ecFromFertilizer = Math.max(0.01, safeTargetEC - water.baseEC)
    const hyproMlPerLiter = (ecFromFertilizer / HYPRO_STRENGTH) * 5
    const totalMlA = hyproMlPerLiter * volume
    const totalMlB = hyproMlPerLiter * volume

    const needsMgSupplement = waterType === 'osmosis_red' && safeTargetEC > 0.8
    const mgSupplementGrams = needsMgSupplement ? ((30 - water.mg) / 10 * volume).toFixed(1) : 0

    return {
      water,
      stageData,
      safeTargetEC,
      ecFromFertilizer,
      hyproMlPerLiter: hyproMlPerLiter.toFixed(1),
      totalMlA: totalMlA.toFixed(0),
      totalMlB: totalMlB.toFixed(0),
      needsMgSupplement,
      mgSupplementGrams
    }
  }, [waterType, stage, volume, targetEC])

  return (
    <Card className="rounded-[3rem] border-4 border-purple-100 overflow-hidden shadow-2xl bg-white mb-10">
      <div className="bg-gradient-to-r from-purple-600 to-indigo-600 p-6 text-white">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Calculator size={34} />
            <div>
              <h3 className="font-black uppercase text-lg tracking-tight">CALCULADOR PRO HY-PRO</h3>
              <p className="text-indigo-200 text-[11px] font-medium">Precisión absoluta para tu solución nutritiva</p>
            </div>
          </div>
          <div className="text-right">
            <div className="text-2xl font-black">{calculations.safeTargetEC.toFixed(2)} mS/cm</div>
            <div className="text-[10px] opacity-80">EC Objetivo</div>
          </div>
        </div>
      </div>

      <div className="p-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
          <div className="space-y-3">
            <label className="flex items-center gap-2 text-sm font-black text-slate-700">
              <Droplets size={16} /> AGUA BASE
            </label>
            <div className="flex flex-col gap-2">
              {Object.entries(WATER_PROFILES).map(([key, w]) => (
                <button
                  key={key}
                  onClick={() => setWaterType(key)}
                  className={`p-3 rounded-2xl text-left border-2 transition-all ${waterType === key ? 'bg-purple-50 border-purple-400 shadow' : 'bg-slate-50 border-slate-200'}`}
                >
                  <div className="font-bold">{w.name}</div>
                  <div className="text-[10px] text-slate-600 mt-1">Ca: {w.ca} mg/L | CE base: {w.baseEC} mS/cm</div>
                </button>
              ))}
            </div>
            <p className="text-[10px] text-slate-500 italic">{calculations.water.note}</p>
          </div>

          <div className="space-y-3">
            <label className="flex items-center gap-2 text-sm font-black text-slate-700">
              <Beaker size={16} /> ETAPA & EC
            </label>
            <div className="flex flex-col gap-2">
              {Object.entries(GROWTH_STAGES).map(([key, s]) => (
                <button
                  key={key}
                  onClick={() => {
                    setStage(key)
                    setTargetEC(s.ecTarget[0])
                  }}
                  className={`p-3 rounded-2xl text-left border-2 transition-all ${stage === key ? 'bg-blue-50 border-blue-400 shadow' : 'bg-slate-50 border-slate-200'}`}
                >
                  <div className="font-bold">{s.name}</div>
                  <div className="text-[10px] text-slate-600">EC: {s.ecTarget[0]} - {s.ecTarget[1]} mS/cm</div>
                </button>
              ))}
            </div>
            
            <div className="mt-4">
              <div className="flex justify-between text-xs font-bold text-slate-600 mb-1">
                <span>Ajuste Fino de EC Objetivo</span>
                <span className="font-black text-purple-700">{targetEC.toFixed(2)} mS/cm</span>
              </div>
              <input
                type="range"
                min={calculations.stageData.ecTarget[0]}
                max={calculations.stageData.ecTarget[1]}
                step="0.1"
                value={targetEC}
                onChange={(e) => setTargetEC(parseFloat(e.target.value))}
                className="w-full h-2 bg-slate-200 rounded-lg appearance-none [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-purple-600"
              />
              <div className="flex justify-between text-[10px] text-slate-500 mt-1">
                <span>Mín: {calculations.stageData.ecTarget[0]}</span>
                <span>Máx: {calculations.stageData.ecTarget[1]}</span>
              </div>
            </div>
          </div>

          <div className="space-y-3">
            <label className="flex items-center gap-2 text-sm font-black text-slate-700">
              <FlaskConical size={16} /> VOLUMEN DEL DEPÓSITO
            </label>
            <div className="bg-gradient-to-br from-cyan-50 to-blue-50 border-2 border-cyan-200 rounded-2xl p-6 text-center">
              <div className="text-5xl font-black text-cyan-800">{volume} L</div>
              <div className="text-cyan-600 text-sm mt-2">Litros</div>
              <input
                type="range"
                min="5"
                max="100"
                step="5"
                value={volume}
                onChange={(e) => setVolume(parseInt(e.target.value))}
                className="w-full h-2 bg-cyan-200 rounded-lg appearance-none [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:h-5 [&::-webkit-slider-thumb]:w-5 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-cyan-700 mt-6"
              />
              <div className="flex justify-between text-[10px] text-cyan-600 mt-2">
                <span>5L</span>
                <span>100L</span>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-r from-slate-50 to-slate-100 border-2 border-slate-200 rounded-[2rem] p-8">
          <h4 className="font-black uppercase text-slate-700 mb-6 text-center text-lg flex items-center justify-center gap-2">
            <Calculator className="text-purple-600" /> DOSIS CALCULADA PARA {volume} LITROS
          </h4>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
            <div className="bg-white p-4 rounded-2xl border-2 border-purple-200">
              <div className="text-[10px] font-black uppercase text-purple-600 mb-1">Hy-Pro A</div>
              <div className="text-3xl font-black text-slate-800">{calculations.totalMlA} ml</div>
              <div className="text-[10px] text-slate-500 mt-1">{calculations.hyproMlPerLiter} ml/L</div>
            </div>
            <div className="bg-white p-4 rounded-2xl border-2 border-blue-200">
              <div className="text-[10px] font-black uppercase text-blue-600 mb-1">Hy-Pro B</div>
              <div className="text-3xl font-black text-slate-800">{calculations.totalMlB} ml</div>
              <div className="text-[10px] text-slate-500 mt-1">{calculations.hyproMlPerLiter} ml/L</div>
            </div>
            <div className="bg-white p-4 rounded-2xl border-2 border-emerald-200">
              <div className="text-[10px] font-black uppercase text-emerald-600 mb-1">EC Final Estimada</div>
              <div className="text-3xl font-black text-slate-800">{calculations.safeTargetEC.toFixed(2)}</div>
              <div className="text-[10px] text-slate-500 mt-1">mS/cm</div>
            </div>
            <div className="bg-white p-4 rounded-2xl border-2 border-amber-200">
              <div className="text-[10px] font-black uppercase text-amber-600 mb-1">CE del Agua</div>
              <div className="text-3xl font-black text-slate-800">{calculations.water.baseEC.toFixed(2)}</div>
              <div className="text-[10px] text-slate-500 mt-1">Restada del total</div>
            </div>
          </div>

          <div className="mt-8 space-y-4">
            <div className="bg-blue-50 border-l-4 border-blue-500 p-4 rounded-r-2xl">
              <p className="text-sm font-bold text-slate-800">📋 Orden de Mezcla CRÍTICO:</p>
              <ol className="text-[11px] text-slate-700 list-decimal ml-4 mt-1 space-y-1">
                <li>Llena el depósito con {volume}L de <strong>{calculations.water.name}</strong>.</li>
                <li>Añade <strong>{calculations.totalMlA} ml de Hy-Pro A</strong>. Mezcla completamente.</li>
                <li>Añade <strong>{calculations.totalMlB} ml de Hy-Pro B</strong>. Mezcla completamente.</li>
                <li><strong>Mide la EC real</strong> con tu medidor y ajusta si es necesario.</li>
                <li>Finalmente, ajusta el pH a <strong>5.8 - 6.2</strong>.</li>
              </ol>
            </div>

            {calculations.needsMgSupplement && (
              <div className="bg-amber-50 border-l-4 border-amber-500 p-4 rounded-r-2xl flex items-start gap-3">
                <AlertTriangle className="text-amber-600 mt-0.5 flex-shrink-0" size={18} />
                <div>
                  <p className="text-sm font-bold text-slate-800">⚠️ Suplemento Necesario:</p>
                  <p className="text-[11px] text-slate-700">
                    Con {calculations.water.name} se recomienda añadir aproximadamente <strong>{calculations.mgSupplementGrams} gramos de Sales de Epsom (MgSO₄)</strong> disueltos en agua tibia, <strong>después del Hy-Pro A y antes del B</strong>, para alcanzar ~30 ppm de Magnesio.
                  </p>
                </div>
              </div>
            )}

            {stage === 'seedling' && (
              <div className="bg-cyan-50 border-l-4 border-cyan-500 p-4 rounded-r-2xl">
                <p className="text-sm font-bold text-slate-800">🌱 Recordatorio para Plántulas:</p>
                <p className="text-[11px] text-slate-700">
                  Esta dosis ({calculations.hyproMlPerLiter} ml/L) está muy por debajo de los 5 ml/L del fabricante para proteger las raíces jóvenes. <strong>Es preferible quedarse ligeramente por debajo que por encima del objetivo de {calculations.safeTargetEC.toFixed(2)} mS/cm</strong>.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </Card>
  )
}
