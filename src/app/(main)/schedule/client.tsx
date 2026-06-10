"use client";

import { useState } from "react";
import { createScheduleAction, deleteScheduleAction, updateScheduleAction } from "@/features/schedule/actions";
import { Plus, Trash2, CalendarClock, Pencil, Save, XCircle } from "lucide-react";

export function ScheduleClient({ initialSchedules, initialExceptions, categories }: any) {
  const [editingId, setEditingId] = useState<number | null>(null);
  
  const [title, setTitle] = useState("");
  const [dayOfWeek, setDayOfWeek] = useState(1);
  const [startTime, setStartTime] = useState("09:00");
  const [endTime, setEndTime] = useState("10:00");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [isPending, setIsPending] = useState(false);

  const days = ["Domingo", "Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado"];

  const handleEditClick = (s: any) => {
    setEditingId(s.id);
    setTitle(s.title);
    setDayOfWeek(s.dayOfWeek);
    setStartTime(s.startTime);
    setEndTime(s.endTime);
    setStartDate(s.startDate || "");
    setEndDate(s.endDate || "");
    setCategoryId(s.categoryId?.toString() || "");
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setTitle("");
    setStartDate("");
    setEndDate("");
  };

  const handleCreateOrUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;
    setIsPending(true);
    
    const data = {
      title,
      dayOfWeek: Number(dayOfWeek),
      startTime,
      endTime,
      startDate: startDate || undefined,
      endDate: endDate || undefined,
      categoryId: categoryId ? Number(categoryId) : undefined
    };

    if (editingId) {
      await updateScheduleAction(editingId, data);
    } else {
      await createScheduleAction(data);
    }

    setEditingId(null);
    setTitle("");
    setStartDate("");
    setEndDate("");
    setIsPending(false);
  };

  const handleDelete = async (id: number) => {
    setIsPending(true);
    await deleteScheduleAction(id);
    setIsPending(false);
  };

  return (
    <div className="space-y-12 animate-in fade-in slide-in-from-bottom-4">
      <form onSubmit={handleCreateOrUpdate} className={`p-6 border rounded-3xl shadow-sm flex flex-col gap-4 transition-colors ${editingId ? 'bg-primary/5 border-primary/50' : 'bg-card'}`}>
        <div className="flex flex-col md:flex-row gap-4 items-end">
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
        </div>
        
        <div className="flex flex-col md:flex-row gap-4 items-end bg-muted/30 p-4 rounded-2xl border border-dashed">
          <div className="w-full md:w-1/2 space-y-2">
            <label className="text-sm font-medium text-muted-foreground flex items-center gap-2">Inicio de Temporada <span className="text-xs font-normal opacity-60">(Opcional)</span></label>
            <input type="date" value={startDate} onChange={e=>setStartDate(e.target.value)} className="w-full px-4 py-3 rounded-xl bg-background border outline-none focus:border-primary text-sm" />
          </div>
          <div className="w-full md:w-1/2 space-y-2">
            <label className="text-sm font-medium text-muted-foreground flex items-center gap-2">Fin de Temporada <span className="text-xs font-normal opacity-60">(Opcional)</span></label>
            <input type="date" value={endDate} onChange={e=>setEndDate(e.target.value)} min={startDate} className="w-full px-4 py-3 rounded-xl bg-background border outline-none focus:border-primary text-sm" />
          </div>
          
          <div className="flex items-center gap-2 w-full md:w-auto md:ml-auto h-[50px]">
            {editingId && (
              <button type="button" onClick={handleCancelEdit} className="px-4 h-full rounded-xl font-bold border border-input bg-background hover:bg-muted transition-colors flex items-center justify-center">
                <XCircle className="w-5 h-5 text-muted-foreground" />
              </button>
            )}
            <button disabled={isPending || !title} type="submit" className={`px-8 h-full rounded-xl font-bold flex items-center justify-center gap-2 whitespace-nowrap transition-colors ${editingId ? 'bg-primary text-primary-foreground hover:bg-primary/90' : 'bg-primary text-primary-foreground hover:bg-primary/90'}`}>
              {editingId ? <><Save className="w-5 h-5" /> Guardar Cambios</> : <><Plus className="w-5 h-5" /> Añadir Rutina</>}
            </button>
          </div>
        </div>
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
                    <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-all">
                      <button onClick={() => handleEditClick(s)} disabled={isPending} className="p-1.5 text-muted-foreground hover:text-primary bg-muted rounded-lg transition-colors">
                        <Pencil className="w-4 h-4" />
                      </button>
                      <button onClick={() => handleDelete(s.id)} disabled={isPending} className="p-1.5 text-muted-foreground hover:text-destructive bg-muted rounded-lg transition-colors">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
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
