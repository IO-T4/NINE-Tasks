"use client";

import { useState, useTransition } from "react";
import { ChevronLeft, ChevronRight, CalendarClock, Ban, Loader2, Globe } from "lucide-react";
import { TaskItem } from "./task-item";
import { cancelScheduleForDateAction } from "@/features/schedule/actions";
import { isSameDay } from "date-fns";

export function CalendarClient({ tasks, schedules = [], exceptions = [], externalEvents = [] }: { tasks: any[], schedules?: any[], exceptions?: any[], externalEvents?: any[] }) {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [isPending, startTransition] = useTransition();
  
  const tasksWithDates = tasks.filter(t => t.dueDate);

  const getDaysInMonth = (year: number, month: number) => new Date(year, month + 1, 0).getDate();
  const getFirstDayOfMonth = (year: number, month: number) => new Date(year, month, 1).getDay();

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  const daysInMonth = getDaysInMonth(year, month);
  let firstDay = getFirstDayOfMonth(year, month);
  
  // Adjust for Monday as first day of week (0=Sun, 1=Mon... -> 0=Mon, 6=Sun)
  firstDay = firstDay === 0 ? 6 : firstDay - 1;

  const monthNames = ["Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio", "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"];

  const prevMonth = () => setCurrentDate(new Date(year, month - 1, 1));
  const nextMonth = () => setCurrentDate(new Date(year, month + 1, 1));

  const [selectedDay, setSelectedDay] = useState<number | null>(null);

  const getDaySchedules = (day: number) => {
    const dateObj = new Date(year, month, day);
    const dayOfWeek = dateObj.getDay(); // 0=Sun, 1=Mon
    
    // Format YYYY-MM-DD for exceptions check
    const yyyy = dateObj.getFullYear();
    const mm = String(dateObj.getMonth() + 1).padStart(2, '0');
    const dd = String(dateObj.getDate()).padStart(2, '0');
    const dateStr = `${yyyy}-${mm}-${dd}`;
    
    return schedules.filter(s => {
      // Check if it's the right day of the week
      if (s.dayOfWeek !== dayOfWeek) return false;
      // Check if there is an exception cancelling it
      const isCancelled = exceptions.some(e => e.scheduleId === s.id && e.exceptionDate === dateStr && e.isCancelled);
      return !isCancelled;
    });
  };

  const getExternalEventsForDay = (day: number) => {
    const dateObj = new Date(year, month, day);
    return externalEvents.filter(ev => {
      // node-ical parsing usually gives proper Date objects for start/end
      return isSameDay(new Date(ev.start), dateObj);
    });
  };

  const handleCancelRoutine = (scheduleId: number, day: number) => {
    const dateObj = new Date(year, month, day);
    const yyyy = dateObj.getFullYear();
    const mm = String(dateObj.getMonth() + 1).padStart(2, '0');
    const dd = String(dateObj.getDate()).padStart(2, '0');
    const dateStr = `${yyyy}-${mm}-${dd}`;
    
    startTransition(async () => {
      await cancelScheduleForDateAction(scheduleId, dateStr);
    });
  };

  const selectedDateTasks = selectedDay 
    ? tasksWithDates.filter(t => {
        const d = new Date(t.dueDate);
        return d.getDate() === selectedDay && d.getMonth() === month && d.getFullYear() === year;
      })
    : [];
    
  const selectedDateSchedules = selectedDay ? getDaySchedules(selectedDay) : [];
  const selectedDateExternal = selectedDay ? getExternalEventsForDay(selectedDay) : [];

  return (
    <div className="space-y-8">
      <div className="bg-card border rounded-3xl p-6 shadow-sm">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold">{monthNames[month]} {year}</h2>
          <div className="flex gap-2">
            <button onClick={prevMonth} className="p-2 border rounded-xl hover:bg-muted transition-colors"><ChevronLeft className="w-5 h-5" /></button>
            <button onClick={nextMonth} className="p-2 border rounded-xl hover:bg-muted transition-colors"><ChevronRight className="w-5 h-5" /></button>
          </div>
        </div>

        <div className="grid grid-cols-7 gap-1 text-center font-medium text-muted-foreground mb-2">
          <div>L</div><div>M</div><div>X</div><div>J</div><div>V</div><div>S</div><div>D</div>
        </div>

        <div className="grid grid-cols-7 gap-1">
          {Array.from({ length: firstDay }).map((_, i) => (
            <div key={`empty-${i}`} className="aspect-square p-1" />
          ))}
          {Array.from({ length: daysInMonth }).map((_, i) => {
            const day = i + 1;
            const hasTasks = tasksWithDates.some(t => {
              const d = new Date(t.dueDate);
              return d.getDate() === day && d.getMonth() === month && d.getFullYear() === year;
            });
            const hasSchedules = getDaySchedules(day).length > 0;
            const hasExternal = getExternalEventsForDay(day).length > 0;
            const isToday = day === new Date().getDate() && month === new Date().getMonth() && year === new Date().getFullYear();
            const isSelected = selectedDay === day;

            return (
              <button
                key={day}
                onClick={() => setSelectedDay(day)}
                className={`aspect-square p-2 border flex flex-col items-center justify-start rounded-xl transition-all relative
                  ${isSelected ? 'border-primary ring-2 ring-primary/20 bg-primary/5' : 'hover:border-primary/50'}
                  ${isToday ? 'bg-muted font-bold' : ''}
                `}
              >
                <span>{day}</span>
                <div className="flex gap-1 mt-auto">
                  {hasExternal && <div className="w-2 h-2 rounded-full bg-orange-500" title="Evento Externo" />}
                  {hasSchedules && <div className="w-2 h-2 rounded-full bg-blue-500" title="Rutinas" />}
                  {hasTasks && <div className="w-2 h-2 rounded-full bg-primary" title="Tareas" />}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {selectedDay && (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4">
          <h3 className="text-xl font-bold border-b pb-2">Plan para el {selectedDay} de {monthNames[month]}</h3>
          
          {selectedDateSchedules.length === 0 && selectedDateTasks.length === 0 && selectedDateExternal.length === 0 ? (
            <p className="text-muted-foreground py-4">Día libre. No hay eventos programados.</p>
          ) : (
            <>
              {selectedDateExternal.length > 0 && (
                <div className="space-y-3">
                  <h4 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-2">
                    <Globe className="w-4 h-4" /> Calendario Externo
                  </h4>
                  {selectedDateExternal.sort((a,b) => new Date(a.start).getTime() - new Date(b.start).getTime()).map(ev => (
                    <div key={ev.id} className="p-4 rounded-2xl border bg-card flex items-center gap-4">
                      <div className="w-2 h-full rounded-full self-stretch" style={{ backgroundColor: ev.color || '#888' }} />
                      <div>
                        <p className="font-bold">{ev.title}</p>
                        <p className="text-sm text-muted-foreground">
                          {new Date(ev.start).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})} - 
                          {new Date(ev.end).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                          <span className="ml-2 px-2 py-0.5 bg-muted rounded text-xs">{ev.calendarName}</span>
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {selectedDateSchedules.length > 0 && (
                <div className="space-y-3 mt-6">
                  <h4 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Rutinas Programadas</h4>
                  {selectedDateSchedules.sort((a,b) => a.startTime.localeCompare(b.startTime)).map(s => (
                    <div key={s.id} className={`group p-4 rounded-2xl border bg-card/60 flex items-center justify-between ${isPending ? 'opacity-50' : ''}`}>
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-blue-500/10 text-blue-500 flex items-center justify-center">
                          <CalendarClock className="w-5 h-5" />
                        </div>
                        <div>
                          <p className="font-bold">{s.title}</p>
                          <p className="text-sm text-muted-foreground">{s.startTime} - {s.endTime}</p>
                        </div>
                      </div>
                      <button 
                        onClick={() => handleCancelRoutine(s.id, selectedDay)}
                        disabled={isPending}
                        className="opacity-0 group-hover:opacity-100 p-2 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-xl transition-all flex items-center gap-2"
                        title="Cancelar solo por hoy"
                      >
                        {isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Ban className="w-4 h-4" />}
                        <span className="text-xs font-medium hidden sm:inline">Anular hoy</span>
                      </button>
                    </div>
                  ))}
                </div>
              )}

              {selectedDateTasks.length > 0 && (
                <div className="space-y-3 mt-6">
                  <h4 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Tareas Específicas</h4>
                  {selectedDateTasks.map(task => (
                    <TaskItem key={task.id} task={task} />
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      )}
    </div>
  );
}
