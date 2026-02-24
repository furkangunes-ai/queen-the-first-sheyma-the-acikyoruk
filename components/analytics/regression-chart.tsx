"use client";

import React, { useMemo } from 'react';
import { Paper, Handwriting, TEXTURES } from '@/components/skeuomorphic';
import {
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  ComposedChart, Area, Line, Scatter, ReferenceLine,
} from 'recharts';
import { TrendingUp, Calendar, Target, Activity, Award, Clock } from 'lucide-react';
import { format } from 'date-fns';
import { tr } from 'date-fns/locale';

interface DataPoint {
  x: number;
  y: number;
  date: string;
  examTitle: string;
}

interface TrendPoint {
  date: string;
  predicted: number;
  lower: number;
  upper: number;
}

interface Prediction {
  targetNet: number;
  estimatedDate: string | null;
  daysFromNow: number | null;
  confidence: number;
  lowerDate: string | null;
  upperDate: string | null;
}

export interface RegressionData {
  slope: number;
  intercept: number;
  rSquared: number;
  standardError: number;
  n: number;
  dataPoints: DataPoint[];
  trendLine: TrendPoint[];
  predictions: Prediction[];
  weeklyGrowth: number;
  dailyGrowth: number;
  currentEstimate: number;
}

interface RegressionChartProps {
  data: RegressionData;
}

// Custom tooltip
function CustomTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null;

  const item = payload[0]?.payload;
  if (!item) return null;

  return (
    <div className="bg-white rounded-lg shadow-lg border border-slate-200 p-3 text-sm">
      <p className="font-medium text-slate-700 mb-1">
        {item.date ? format(new Date(item.date), 'd MMMM yyyy', { locale: tr }) : label}
      </p>
      {item.actual !== undefined && item.actual !== null && (
        <p className="text-blue-600">
          <span className="inline-block w-2 h-2 bg-blue-600 rounded-full mr-1.5" />
          Gerçek: <span className="font-bold">{item.actual.toFixed(1)}</span> net
        </p>
      )}
      {item.predicted !== undefined && item.predicted !== null && (
        <p className="text-indigo-600">
          <span className="inline-block w-2 h-2 bg-indigo-500 rounded-full mr-1.5" />
          Tahmin: <span className="font-bold">{item.predicted.toFixed(1)}</span> net
        </p>
      )}
      {item.lower !== undefined && item.upper !== undefined && (
        <p className="text-slate-400 text-xs">
          Aralık: {item.lower.toFixed(1)} – {item.upper.toFixed(1)}
        </p>
      )}
      {item.examTitle && (
        <p className="text-slate-500 text-xs mt-1">{item.examTitle}</p>
      )}
    </div>
  );
}

export function RegressionChart({ data }: RegressionChartProps) {
  // Merge data points and trend line into a unified chart dataset
  const chartData = useMemo(() => {
    // Create a map of date -> actual data
    const actualMap = new Map<string, DataPoint>();
    data.dataPoints.forEach(dp => {
      actualMap.set(dp.date, dp);
    });

    // Build chart data from trend line, merging actual values where available
    const merged = data.trendLine.map(tp => {
      const actual = actualMap.get(tp.date);
      return {
        date: tp.date,
        dateLabel: format(new Date(tp.date), 'd MMM', { locale: tr }),
        predicted: tp.predicted,
        lower: tp.lower,
        upper: tp.upper,
        confidenceRange: [tp.lower, tp.upper],
        actual: actual ? actual.y : null,
        examTitle: actual?.examTitle || null,
      };
    });

    // Also add any actual data points that don't fall on trend line dates
    data.dataPoints.forEach(dp => {
      if (!data.trendLine.find(tp => tp.date === dp.date)) {
        const predicted = data.slope * dp.x + data.intercept;
        merged.push({
          date: dp.date,
          dateLabel: format(new Date(dp.date), 'd MMM', { locale: tr }),
          predicted: Number(predicted.toFixed(2)),
          lower: Number((predicted - data.standardError).toFixed(2)),
          upper: Number((predicted + data.standardError).toFixed(2)),
          confidenceRange: [predicted - data.standardError, predicted + data.standardError],
          actual: dp.y,
          examTitle: dp.examTitle,
        });
      }
    });

    // Sort by date
    merged.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

    return merged;
  }, [data]);

  // Target lines for common net goals
  const targetNets = data.predictions.map(p => p.targetNet);

  const rSquaredPercent = Math.round(data.rSquared * 100);

  return (
    <div className="flex flex-col gap-6">
      {/* Summary Stats Row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-lg shadow-sm border border-slate-200 flex flex-col items-center justify-center py-5">
          <TrendingUp className="text-green-500 mb-1" size={20} />
          <span className="text-2xl font-bold text-slate-800">
            {data.weeklyGrowth > 0 ? '+' : ''}{data.weeklyGrowth}
          </span>
          <span className="text-[10px] text-slate-500 uppercase tracking-widest">Haftalık Gelişim</span>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-sm border border-slate-200 flex flex-col items-center justify-center py-5">
          <Activity className="text-blue-500 mb-1" size={20} />
          <span className="text-2xl font-bold text-slate-800">
            {data.dailyGrowth > 0 ? '+' : ''}{data.dailyGrowth}
          </span>
          <span className="text-[10px] text-slate-500 uppercase tracking-widest">Günlük Gelişim</span>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-sm border border-slate-200 flex flex-col items-center justify-center py-5">
          <Target className="text-indigo-500 mb-1" size={20} />
          <span className="text-2xl font-bold text-slate-800">{data.currentEstimate}</span>
          <span className="text-[10px] text-slate-500 uppercase tracking-widest">Tahmini Net</span>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-sm border border-slate-200 flex flex-col items-center justify-center py-5">
          <Award className={`mb-1 ${rSquaredPercent >= 70 ? 'text-green-500' : rSquaredPercent >= 40 ? 'text-yellow-500' : 'text-red-400'}`} size={20} />
          <span className="text-2xl font-bold text-slate-800">%{rSquaredPercent}</span>
          <span className="text-[10px] text-slate-500 uppercase tracking-widest">Model Güvenilirliği</span>
        </div>
      </div>

      {/* Main Regression Chart */}
      <Paper className="p-2 sm:p-4" style={{
        backgroundImage: `url(${TEXTURES.graph})`,
        backgroundSize: '300px',
      }}>
        <div className="bg-white/80 backdrop-blur-[2px] rounded-lg p-4 border border-slate-300">
          <h3 className="text-slate-500 font-bold uppercase tracking-wider text-xs mb-4">
            Net Projeksiyon Grafiği
          </h3>
          <ResponsiveContainer width="100%" height={380}>
            <ComposedChart data={chartData} margin={{ top: 10, right: 20, bottom: 10, left: 10 }}>
              <defs>
                <linearGradient id="colorConfidence" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#6366f1" stopOpacity={0.15} />
                  <stop offset="95%" stopColor="#6366f1" stopOpacity={0.03} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis
                dataKey="dateLabel"
                tick={{ fontSize: 10, fill: '#64748b' }}
                tickLine={false}
                interval="preserveStartEnd"
              />
              <YAxis
                tick={{ fontSize: 10, fill: '#64748b' }}
                tickLine={false}
                domain={['auto', 'auto']}
              />
              <Tooltip content={<CustomTooltip />} />

              {/* Confidence interval area */}
              <Area
                type="monotone"
                dataKey="confidenceRange"
                stroke="none"
                fill="url(#colorConfidence)"
                fillOpacity={1}
                name="Güven Aralığı"
                isAnimationActive={false}
              />

              {/* Target reference lines */}
              {targetNets.map(target => (
                <ReferenceLine
                  key={target}
                  y={target}
                  stroke="#94a3b8"
                  strokeDasharray="6 4"
                  strokeWidth={1}
                  label={{
                    value: `${target} net`,
                    position: 'right',
                    fill: '#94a3b8',
                    fontSize: 10,
                  }}
                />
              ))}

              {/* Regression line */}
              <Line
                type="monotone"
                dataKey="predicted"
                stroke="#6366f1"
                strokeWidth={2.5}
                dot={false}
                name="Regresyon Doğrusu"
                strokeDasharray="0"
              />

              {/* Actual data points */}
              <Scatter
                dataKey="actual"
                fill="#3b82f6"
                stroke="#fff"
                strokeWidth={2}
                name="Gerçek Sonuçlar"
                r={5}
              />
            </ComposedChart>
          </ResponsiveContainer>
          <div className="flex items-center justify-center gap-6 mt-3 text-xs text-slate-500">
            <div className="flex items-center gap-1.5">
              <div className="w-3 h-3 rounded-full bg-blue-500" />
              <span>Gerçek Sonuçlar</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-6 h-0.5 bg-indigo-500" />
              <span>Regresyon Doğrusu</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-3 h-3 rounded bg-indigo-100 border border-indigo-200" />
              <span>Güven Aralığı (%95)</span>
            </div>
          </div>
        </div>
      </Paper>

      {/* Predictions */}
      {data.predictions.length > 0 && (
        <Paper className="p-4 sm:p-6">
          <h3 className="text-slate-500 font-bold uppercase tracking-wider text-xs mb-4">
            Hedef Tahminleri
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {data.predictions.map(pred => {
              const isAchieved = pred.daysFromNow !== null && pred.daysFromNow <= 0;
              const isReachable = pred.estimatedDate !== null;

              return (
                <div
                  key={pred.targetNet}
                  className={`rounded-lg border p-4 transition-all ${
                    isAchieved
                      ? 'bg-green-50 border-green-200'
                      : isReachable
                      ? 'bg-white border-slate-200'
                      : 'bg-slate-50 border-slate-200 opacity-60'
                  }`}
                >
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <Target
                        size={18}
                        className={isAchieved ? 'text-green-500' : 'text-indigo-500'}
                      />
                      <span className="font-bold text-lg text-slate-800">{pred.targetNet} Net</span>
                    </div>
                    {isAchieved && (
                      <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full font-bold uppercase tracking-wider">
                        Ulaşıldı
                      </span>
                    )}
                  </div>

                  {isAchieved ? (
                    <p className="text-sm text-green-600 font-medium">
                      Bu hedefe zaten ulaştın!
                    </p>
                  ) : isReachable ? (
                    <>
                      <div className="flex items-center gap-2 text-sm text-slate-600 mb-2">
                        <Calendar size={14} />
                        <span>
                          Tahmini tarih:{' '}
                          <span className="font-bold text-slate-800">
                            {format(new Date(pred.estimatedDate!), 'd MMMM yyyy', { locale: tr })}
                          </span>
                        </span>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-slate-600 mb-3">
                        <Clock size={14} />
                        <span>
                          {pred.daysFromNow! > 0
                            ? `${pred.daysFromNow} gün sonra`
                            : 'Hedef aralığındasın'}
                        </span>
                      </div>
                      {/* Progress bar */}
                      {data.currentEstimate > 0 && (
                        <div className="mt-2">
                          <div className="flex justify-between text-[10px] text-slate-400 mb-1">
                            <span>İlerleme</span>
                            <span>%{Math.min(100, Math.round((data.currentEstimate / pred.targetNet) * 100))}</span>
                          </div>
                          <div className="w-full bg-slate-100 rounded-full h-2">
                            <div
                              className="bg-indigo-500 h-2 rounded-full transition-all duration-500"
                              style={{
                                width: `${Math.min(100, Math.max(0, (data.currentEstimate / pred.targetNet) * 100))}%`
                              }}
                            />
                          </div>
                        </div>
                      )}
                      {pred.lowerDate && pred.upperDate && (
                        <p className="text-[10px] text-slate-400 mt-2">
                          Güven aralığı: {format(new Date(pred.lowerDate), 'd MMM yy', { locale: tr })}
                          {' – '}
                          {format(new Date(pred.upperDate), 'd MMM yy', { locale: tr })}
                        </p>
                      )}
                    </>
                  ) : (
                    <p className="text-sm text-slate-400 italic">
                      Mevcut gidişatla bu hedefe ulaşım tahmin edilemiyor
                    </p>
                  )}
                </div>
              );
            })}
          </div>
        </Paper>
      )}

      {/* Model Info */}
      <div className="text-center text-[10px] text-slate-400 py-2">
        Lineer regresyon modeli: y = {data.slope.toFixed(4)}x + {data.intercept.toFixed(2)} | R² = {data.rSquared.toFixed(4)} | n = {data.n} deneme
      </div>
    </div>
  );
}
