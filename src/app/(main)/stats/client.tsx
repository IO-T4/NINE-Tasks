/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable react-hooks/set-state-in-effect */
"use client";

import { useMemo, useState, useEffect } from "react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell, Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis } from "recharts";
import { Trophy, CheckCircle, Activity, Zap, Lock } from "lucide-react";
import { format, subDays, isSameDay } from "date-fns";
import { es } from "date-fns/locale";

export function StatsClient({ tasks, profile, attributes = [], titles = [], userTitles = [] }: { tasks: any[], profile: any, attributes?: any[], titles?: any[], userTitles?: any[] }) {
  const [isBrowser, setIsBrowser] = useState(false);
  
  useEffect(() => {
    setIsBrowser(true);
  }, []);

  const stats = useMemo(() => {
    const completedTasks = tasks.filter(t => t.isCompleted);
    
    // Last 7 days chart data
    const chartData = Array.from({ length: 7 }).map((_, i) => {
      const date = subDays(new Date(), 6 - i);
      const count = completedTasks.filter(t => t.updatedAt && isSameDay(new Date(t.updatedAt), date)).length;
      return {
        name: format(date, "EEEEE", { locale: es }).toUpperCase(),
        fullName: format(date, "EEEE d", { locale: es }),
        completadas: count,
      };
    });

    const totalTimeSpent = completedTasks.reduce((acc, t) => acc + (t.timeSpentSeconds || 0), 0);
    const totalHours = Math.floor(totalTimeSpent / 3600);
    
    // Most productive energy level
    const energyCounts = { low: 0, medium: 0, high: 0 };
    completedTasks.forEach(t => {
      if (t.energyLevel && t.energyLevel in energyCounts) {
        energyCounts[t.energyLevel as keyof typeof energyCounts]++;
      }
    });
    
    let bestEnergy = "N/A";
    let max = 0;
    Object.entries(energyCounts).forEach(([k, v]) => {
      if (v > max) { max = v; bestEnergy = k === 'low' ? 'Baja' : k === 'medium' ? 'Media' : 'Alta'; }
    });

    return {
      totalCompleted: completedTasks.length,
      completionRate: tasks.length ? Math.round((completedTasks.length / tasks.length) * 100) : 0,
      totalHours,
      bestEnergy,
      chartData
    };
  }, [tasks]);

  if (!isBrowser) return null;

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4">
      {/* existing stat boxes */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-card border rounded-3xl p-6 shadow-sm">
          <div className="flex items-center gap-3 text-muted-foreground mb-4">
            <CheckCircle className="w-5 h-5 text-primary" />
            <h3 className="font-semibold text-sm uppercase tracking-wider">Completadas</h3>
          </div>
          <p className="text-4xl font-extrabold">{stats.totalCompleted}</p>
          <p className="text-sm text-muted-foreground mt-2">En total</p>
        </div>

        <div className="bg-card border rounded-3xl p-6 shadow-sm">
          <div className="flex items-center gap-3 text-muted-foreground mb-4">
            <Activity className="w-5 h-5 text-blue-500" />
            <h3 className="font-semibold text-sm uppercase tracking-wider">Tasa de Éxito</h3>
          </div>
          <p className="text-4xl font-extrabold">{stats.completionRate}%</p>
          <p className="text-sm text-muted-foreground mt-2">De tareas creadas</p>
        </div>

        <div className="bg-card border rounded-3xl p-6 shadow-sm">
          <div className="flex items-center gap-3 text-muted-foreground mb-4">
            <Trophy className="w-5 h-5 text-amber-500" />
            <h3 className="font-semibold text-sm uppercase tracking-wider">Nivel Actual</h3>
          </div>
          <p className="text-4xl font-extrabold">{profile?.level || 1}</p>
          <p className="text-sm text-muted-foreground mt-2">{profile?.xp || 0} XP acumulada</p>
        </div>

        <div className="bg-card border rounded-3xl p-6 shadow-sm">
          <div className="flex items-center gap-3 text-muted-foreground mb-4">
            <Zap className="w-5 h-5 text-orange-500" />
            <h3 className="font-semibold text-sm uppercase tracking-wider">Mejor Energía</h3>
          </div>
          <p className="text-3xl font-extrabold">{stats.bestEnergy}</p>
          <p className="text-sm text-muted-foreground mt-2">Donde eres más eficaz</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="bg-card border rounded-3xl p-6 shadow-sm">
          <h3 className="text-xl font-bold mb-6">Actividad (Últimos 7 días)</h3>
          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={stats.chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: 'currentColor', opacity: 0.5 }} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: 'currentColor', opacity: 0.5 }} />
                <Tooltip 
                  cursor={{ fill: 'rgba(255,255,255,0.05)' }}
                  contentStyle={{ borderRadius: '16px', border: 'none', background: 'hsl(var(--card))', color: 'hsl(var(--foreground))', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }} 
                />
                <Bar dataKey="completadas" radius={[8, 8, 8, 8]}>
                  {stats.chartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={index === stats.chartData.length - 1 ? 'hsl(var(--primary))' : 'hsl(var(--primary) / 0.4)'} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-card border rounded-3xl p-6 shadow-sm">
          <h3 className="text-xl font-bold mb-6">Balance Vital (Atributos)</h3>
          <div className="h-72 w-full">
            {attributes && attributes.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <RadarChart cx="50%" cy="50%" outerRadius="70%" data={attributes}>
                  <PolarGrid stroke="hsl(var(--border))" />
                  <PolarAngleAxis dataKey="name" tick={{ fill: 'currentColor', fontSize: 12, opacity: 0.8 }} />
                  <Tooltip 
                    contentStyle={{ borderRadius: '16px', border: 'none', background: 'hsl(var(--card))', color: 'hsl(var(--foreground))', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }} 
                  />
                  <Radar name="XP Ganada" dataKey="xpEarned" stroke="hsl(var(--primary))" fill="hsl(var(--primary))" fillOpacity={0.5} />
                </RadarChart>
              </ResponsiveContainer>
            ) : (
              <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                No hay datos de atributos.
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Titulos Vitrine */}
      <div className="bg-card border rounded-3xl p-6 shadow-sm mt-8">
        <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
          <Trophy className="w-6 h-6 text-amber-500" /> Vitrina de Títulos
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {titles.map((title) => {
            const isUnlocked = userTitles.some(ut => ut.titleId === title.id);
            const attribute = attributes.find(a => a.id === title.attributeId);
            
            return (
              <div 
                key={title.id} 
                className={`p-4 rounded-2xl border transition-all ${
                  isUnlocked 
                    ? 'bg-primary/5 border-primary/20 shadow-sm' 
                    : 'bg-muted/30 border-dashed opacity-60 grayscale'
                }`}
              >
                <div className="flex items-start justify-between">
                  <div>
                    <h4 className={`font-bold text-lg ${isUnlocked ? 'text-primary' : 'text-muted-foreground'}`}>
                      {isUnlocked ? title.name : '???'}
                    </h4>
                    <p className="text-sm text-muted-foreground mt-1">
                      {attribute?.name}: {title.requiredTasks} tareas completadas
                    </p>
                  </div>
                  {!isUnlocked && (
                    <div className="bg-background rounded-full p-2 text-muted-foreground">
                      <Lock className="w-4 h-4" />
                    </div>
                  )}
                  {isUnlocked && (
                    <div className="bg-primary/20 rounded-full p-2 text-primary">
                      <Trophy className="w-4 h-4" />
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
