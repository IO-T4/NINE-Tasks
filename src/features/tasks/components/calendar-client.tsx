"use client";

import { useState, useTransition } from "react";
import { ChevronLeft, ChevronRight, CalendarClock, Ban, Loader2, Globe, Plus, Trash2 } from "lucide-react";
import { TaskItem } from "./task-item";
import { cancelScheduleForDateAction } from "@/features/schedule/actions";
import { createCalendarEventAction, deleteCalendarEventAction } from "@/features/calendar/actions";
import { isSameDay, parseISO } from "date-fns";
import { PREDEFINED_COLORS, getColorHex } from "@/lib/colors";

type CalendarClientProps = {
  tasks: any[];
  schedules?: any[];
  exceptions?: any[];
  externalEvents?: any[];
  manualEvents?: any[];
  categories?: any[];
};

export function CalendarClient({ tasks, schedules = [], exceptions = [], externalEvents = [], manualEvents = [], categories = [] }: CalendarClientProps) {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [isPending, startTransition] = useTransition();
  const [selectedDay, setSelectedDay] = useState<number | null>(null);
  
  const [isAddingEvent, setIsAddingEvent] = useState(false);
  const [newEventTitle, setNewEventTitle] = useState("");
  const [newEventTime, setNewEventTime] = useState("12:00");
  const [newEventDuration, setNewEventDuration] = useState(60); // minutes
  const [newEventColor, setNewEventColor] = useState("blue");
  
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

  const getDaySchedules = (day: number) => {
    const dateObj = new Date(year, month, day);
    const dayOfWeek = dateObj.getDay(); // 0=Sun, 1=Mon
    
    // Format YYYY-MM-DD for exceptions and boundaries check
    const yyyy = dateObj.getFullYear();
    const mm = String(dateObj.getMonth() + 1).padStart(2, '0');
    const dd = String(dateObj.getDate()).padStart(2, '0');
    const dateStr = `${yyyy}-${mm}-${dd}`;
    
    return schedules.filter(s => {
      if (s.dayOfWeek !== dayOfWeek) return false;

      // Check seasonal bounds
      if (s.startDate && dateStr < s.startDate) return false;
      if (s.endDate && dateStr > s.endDate) return false;

      const isCancelled = exceptions.some(e => e.scheduleId === s.id && e.exceptionDate === dateStr && e.isCancelled);
      return !isCancelled;
    });
  };

  const getExternalEventsForDay = (day: number) => {
    const dateObj = new Date(year, month, day);
    return externalEvents.filter(ev => isSameDay(new Date(ev.start), dateObj));
  };

  const getManualEventsForDay = (day: number) => {
    const dateObj = new Date(year, month, day);
    return manualEvents.filter(ev => isSameDay(new Date(ev.startAt), dateObj));
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

  const handleAddEvent = () => {
    if (!selectedDay || !newEventTitle) return;
    
    const [hours, minutes] = newEventTime.split(':').map(Number);
    const startAt = new Date(year, month, selectedDay, hours, minutes);
    const endAt = new Date(startAt.getTime() + newEventDuration * 60000);
    
    startTransition(async () => {
      await createCalendarEventAction(newEventTitle, startAt, endAt, newEventColor, null, "");
      setIsAddingEvent(false);
      setNewEventTitle("");
    });
  };

  const handleDeleteEvent = (id: number) => {
    startTransition(async () => {
      await deleteCalendarEventAction(id);
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
  const selectedDateManual = selectedDay ? getManualEventsForDay(selectedDay) : [];

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
            const dayTasks = tasksWithDates.filter(t => {
              const d = new Date(t.dueDate);
              return d.getDate() === day && d.getMonth() === month && d.getFullYear() === year;
            });
            const daySchedules = getDaySchedules(day);
            const dayExternal = getExternalEventsForDay(day);
            const dayManual = getManualEventsForDay(day);
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
                <div className="flex flex-wrap justify-center gap-1 mt-auto px-1 w-full">
                  {/* Eventos Externos y Manuales (Colores reales) */}
                  {dayExternal.map(ev => (
                    <div key={ev.id} className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: getColorHex(ev.color) }} title={ev.title} />
                  ))}
                  {dayManual.map(ev => (
                    <div key={ev.id} className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: getColorHex(ev.color) }} title={ev.title} />
                  ))}

                  {/* Rutinas (Icono de reloj) */}
                  {daySchedules.length > 0 && (
                    <span title={`${daySchedules.length} Rutinas`}>
                      <CalendarClock className="w-4 h-4 text-blue-500 shrink-0" />
                    </span>
                  )}

                  {/* Tareas (Número e icono de prioridad) */}
                  {dayTasks.length > 0 && (
                    <div className="flex items-center gap-1 text-[11px] leading-none font-bold text-primary shrink-0">
                      <span>{dayTasks.length}</span>
                      {dayTasks.some(t => t.priority === 'urgent') ? (
                        <div className="w-2 h-2 rounded-full bg-destructive shrink-0" title="Tareas Urgentes" />
                      ) : dayTasks.some(t => t.priority === 'high') ? (
                        <div className="w-2 h-2 rounded-full bg-orange-500 shrink-0" title="Tareas Altas" />
                      ) : (
                        <div className="w-2 h-2 rounded-full bg-primary shrink-0" title="Tareas" />
                      )}
                    </div>
                  )}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {selectedDay && (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4">
          <div className="flex items-center justify-between border-b pb-2">
            <h3 className="text-xl font-bold">Plan para el {selectedDay} de {monthNames[month]}</h3>
            <button 
              onClick={() => setIsAddingEvent(!isAddingEvent)}
              className="flex items-center gap-1 text-sm bg-primary/10 text-primary px-3 py-1.5 rounded-lg hover:bg-primary/20 transition-colors font-semibold"
            >
              <Plus className="w-4 h-4" /> Nuevo Evento
            </button>
          </div>
          
          {isAddingEvent && (
            <div className="p-4 border rounded-2xl bg-card shadow-sm space-y-4">
              <h4 className="font-bold">Añadir Evento</h4>
              <input 
                type="text" 
                placeholder="Título del evento..." 
                className="w-full px-4 py-2 rounded-xl bg-background border outline-none focus:border-primary"
                value={newEventTitle}
                onChange={e => setNewEventTitle(e.target.value)}
                disabled={isPending}
              />
              <div className="flex flex-wrap gap-4">
                <div className="flex-1 min-w-[120px]">
                  <label className="text-xs text-muted-foreground mb-1 block">Hora inicio</label>
                  <input 
                    type="time" 
                    className="w-full px-4 py-2 rounded-xl bg-background border outline-none focus:border-primary"
                    value={newEventTime}
                    onChange={e => setNewEventTime(e.target.value)}
                    disabled={isPending}
                  />
                </div>
                <div className="flex-1 min-w-[120px]">
                  <label className="text-xs text-muted-foreground mb-1 block">Duración (min)</label>
                  <input 
                    type="number" 
                    className="w-full px-4 py-2 rounded-xl bg-background border outline-none focus:border-primary"
                    value={newEventDuration}
                    onChange={e => setNewEventDuration(Number(e.target.value))}
                    disabled={isPending}
                  />
                </div>
                <div className="flex-1 min-w-[120px]">
                  <label className="text-xs text-muted-foreground mb-1 block">Color</label>
                  <select 
                    className="w-full px-4 py-2 rounded-xl bg-background border outline-none focus:border-primary"
                    value={newEventColor}
                    onChange={e => setNewEventColor(e.target.value)}
                    disabled={isPending}
                  >
                    {PREDEFINED_COLORS.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                  </select>
                </div>
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button onClick={() => setIsAddingEvent(false)} disabled={isPending} className="px-4 py-2 rounded-xl hover:bg-muted transition-colors text-sm">Cancelar</button>
                <button onClick={handleAddEvent} disabled={isPending || !newEventTitle} className="px-4 py-2 rounded-xl bg-primary text-primary-foreground hover:bg-primary/90 transition-colors text-sm font-semibold flex items-center gap-2">
                  {isPending && <Loader2 className="w-4 h-4 animate-spin" />} Guardar
                </button>
              </div>
            </div>
          )}

          {selectedDateSchedules.length === 0 && selectedDateTasks.length === 0 && selectedDateExternal.length === 0 && selectedDateManual.length === 0 ? (
            <p className="text-muted-foreground py-4">Día libre. No hay eventos programados.</p>
          ) : (
            <>
              {(selectedDateExternal.length > 0 || selectedDateManual.length > 0) && (
                <div className="space-y-3">
                  <h4 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-2">
                    <Globe className="w-4 h-4" /> Calendario
                  </h4>
                  {selectedDateExternal.sort((a,b) => new Date(a.start).getTime() - new Date(b.start).getTime()).map(ev => (
                    <div key={ev.id} className="p-4 rounded-2xl border bg-card flex items-center gap-4">
                      <div className="w-2 h-full rounded-full self-stretch" style={{ backgroundColor: getColorHex(ev.color) }} />
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
                  {selectedDateManual.sort((a,b) => new Date(a.startAt).getTime() - new Date(b.startAt).getTime()).map(ev => (
                    <div key={ev.id} className={`group p-4 rounded-2xl border bg-card flex items-center justify-between ${isPending ? 'opacity-50' : ''}`}>
                      <div className="flex items-center gap-4">
                        <div className="w-2 h-full rounded-full self-stretch min-h-[40px]" style={{ backgroundColor: getColorHex(ev.color) }} />
                        <div>
                          <p className="font-bold">{ev.title}</p>
                          <p className="text-sm text-muted-foreground">
                            {new Date(ev.startAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})} - 
                            {new Date(ev.endAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                          </p>
                        </div>
                      </div>
                      <button 
                        onClick={() => handleDeleteEvent(ev.id)}
                        disabled={isPending}
                        className="opacity-0 group-hover:opacity-100 p-2 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-xl transition-all"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
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
