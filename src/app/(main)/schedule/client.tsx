"use client";

import { useState } from "react";
import { createScheduleAction, deleteScheduleAction } from "@/features/schedule/actions";
import { Plus, Trash2, CalendarClock } from "lucide-react";

export function ScheduleClient({ initialSchedules, initialExceptions, categories }: any) {
  const [title, setTitle] = useState("");
  const [dayOfWeek, setDayOfWeek] = useState(1);
  const [startTime, setStartTime] = useState("09:00");
  const [endTime, setEndTime] = useState("10:00");
  const [categoryId, setCategoryId] = useState("");
  const [isPending, setIsPending] = useState(false);

  const days = ["Domingo", "Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado"];

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;
    setIsPending(true);
    await createScheduleAction({
      title,
      dayOfWeek: Number(dayOfWeek),
      startTime,
      endTime,
      categoryId: categoryId ? Number(categoryId) : undefined
    });
    setTitle("");
    setIsPending(false);
  };

  const handleDelete = async (id: number) => {
    setIsPending(true);
    await deleteScheduleAction(id);
    setIsPending(false);
  };

  return (
    <div className="space-y-12 animate-in fade-in slide-in-from-bottom-4">
      <form onSubmit={handleCreate} className="p-6 bg-card border rounded-3xl shadow-sm flex flex-col md:flex-row gap-4 items-end">
        <div className="flex-1 w-full space-y-2">
          <label className="text-sm font-medium">Rutina</label>
          <input required value={title} onChange={e=>setTitle(e.target.value)} type="text" placeholder="Ej: Gimnasio" className="w-full px-4 py-3 rounded-xl bg-background border outline-none focus:border-primary" />
        </div>
        <div className="w-full md:w-auto space-y-2">
          <label className="text-sm font-medium">Día</label>
          <select value={dayOfWeek} onChange={e=>setDayOfWeek(Number(e.target.value))} className="w-full px-4 py-3 rounded-xl bg-background border outline-none focus:border-primary">
            {days.map((d, i) => <option key={i} value={i}>{d}</option>)}
          </select>
        </div>
        <div className="w-full md:w-auto space-y-2">
          <label className="text-sm font-medium">Inicio</label>
          <input required type="time" value={startTime} onChange={e=>setStartTime(e.target.value)} className="w-full px-4 py-3 rounded-xl bg-background border outline-none focus:border-primary" />
        </div>
        <div className="w-full md:w-auto space-y-2">
          <label className="text-sm font-medium">Fin</label>
          <input required type="time" value={endTime} onChange={e=>setEndTime(e.target.value)} className="w-full px-4 py-3 rounded-xl bg-background border outline-none focus:border-primary" />
        </div>
        <button disabled={isPending || !title} type="submit" className="w-full md:w-auto bg-primary text-primary-foreground px-6 py-3 rounded-xl font-medium hover:bg-primary/90 flex items-center justify-center gap-2">
          <Plus className="w-5 h-5" /> Añadir
        </button>
      </form>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {days.map((day, index) => {
          const daySchedules = initialSchedules.filter((s:any) => s.dayOfWeek === index);
          if (daySchedules.length === 0) return null;
          
          return (
            <div key={index} className="border rounded-3xl p-6 bg-card/50">
              <h3 className="font-bold text-xl mb-4 text-primary">{day}</h3>
              <div className="space-y-4">
                {daySchedules.sort((a:any,b:any) => a.startTime.localeCompare(b.startTime)).map((s:any) => (
                  <div key={s.id} className="p-4 bg-background border rounded-2xl flex items-start justify-between group">
                    <div>
                      <div className="font-semibold text-foreground/90">{s.title}</div>
                      <div className="text-sm text-muted-foreground flex items-center gap-1 mt-1">
                        <CalendarClock className="w-3.5 h-3.5" /> {s.startTime} - {s.endTime}
                      </div>
                    </div>
                    <button onClick={() => handleDelete(s.id)} disabled={isPending} className="opacity-0 group-hover:opacity-100 text-muted-foreground hover:text-destructive transition-all">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  );
}
