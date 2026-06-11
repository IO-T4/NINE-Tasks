"use client";

import { useState, useTransition } from "react";
import { TaskItem } from "./task-item";
import { Folder, Play, Pause, Clock, GripVertical, Zap } from "lucide-react";
import { startTimerAction, pauseTimerAction } from "@/features/time-tracker/actions";
import { updateTaskOrderAction } from "../actions/task.actions";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";
import { AnimatePresence } from "framer-motion";

type TaskListClientProps = {
  groupedTasks: Record<string, any[]>;
  allTasks?: any[];
};

export function TaskListClient({ groupedTasks, allTasks = [] }: TaskListClientProps) {
  const [selectedTaskIds, setSelectedTaskIds] = useState<Set<number>>(new Set());
  const [isPending, startTransition] = useTransition();

  const [searchQuery, setSearchQuery] = useState("");
  const [priorityFilter, setPriorityFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [sortBy, setSortBy] = useState<string>("manual"); // "manual", "date", "priority"
  const [energyFilter, setEnergyFilter] = useState<string>("all");
  const [microTaskFilter, setMicroTaskFilter] = useState<boolean>(false);

  const toggleSelection = (taskId: number) => {
    const newSet = new Set(selectedTaskIds);
    if (newSet.has(taskId)) {
      newSet.delete(taskId);
    } else {
      newSet.add(taskId);
    }
    setSelectedTaskIds(newSet);
  };

  const handleStartTimer = async () => {
    if (selectedTaskIds.size === 0) return;
    startTransition(async () => {
      await startTimerAction(Array.from(selectedTaskIds));
      setSelectedTaskIds(newSet => { newSet.clear(); return newSet; }); 
    });
  };

  const handlePauseTimer = async (taskId: number) => {
    startTransition(async () => {
      await pauseTimerAction([taskId]);
    });
  };

  const onDragEnd = (result: any) => {
    if (!result.destination) return;
    
    const sourceCategory = result.source.droppableId;
    const destCategory = result.destination.droppableId;
    
    if (sourceCategory !== destCategory) return; // For now, only drag within the same category
    
    const catTasks = filteredGroupedTasks[sourceCategory];
    if (!catTasks) return;

    const newTasks = Array.from(catTasks);
    const [reorderedItem] = newTasks.splice(result.source.index, 1);
    newTasks.splice(result.destination.index, 0, reorderedItem);

    const updates = newTasks.map((t, index) => ({ id: t.id, orderIndex: index }));
    
    startTransition(async () => {
      await updateTaskOrderAction(updates);
    });
  };

  const playingTasks = Object.values(groupedTasks).flat().filter(t => t.timerStatus === "playing");

  const filteredGroupedTasks: Record<string, any[]> = {};
  
  for (const [category, tasks] of Object.entries(groupedTasks)) {
    let filteredTasks = tasks.filter(task => {
      const matchesSearch = task.title.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesPriority = priorityFilter === "all" || task.priority === priorityFilter;
      const matchesStatus = 
        statusFilter === "all" || 
        (statusFilter === "done" && task.isCompleted) || 
        (statusFilter === "todo" && !task.isCompleted);
      const matchesEnergy = energyFilter === "all" || task.energyLevel === energyFilter;
      const matchesMicroTask = !microTaskFilter || task.isMicroTask;
      return matchesSearch && matchesPriority && matchesStatus && matchesEnergy && matchesMicroTask;
    });

    filteredTasks.sort((a, b) => {
      if (a.isPinned && !b.isPinned) return -1;
      if (!a.isPinned && b.isPinned) return 1;

      if (sortBy === "date") {
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      }
      if (sortBy === "priority") {
        const priorityOrder: Record<string, number> = { urgent: 4, high: 3, medium: 2, low: 1 };
        const pA = priorityOrder[a.priority] || 0;
        const pB = priorityOrder[b.priority] || 0;
        if (pA !== pB) return pB - pA;
      }
      return a.orderIndex - b.orderIndex;
    });

    if (filteredTasks.length > 0) {
      filteredGroupedTasks[category] = filteredTasks;
    }
  }

  return (
    <>
      {selectedTaskIds.size > 0 && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 bg-card border shadow-2xl rounded-full px-6 py-4 flex items-center gap-6 animate-in slide-in-from-bottom-10">
          <span className="font-semibold text-foreground">{selectedTaskIds.size} seleccionadas</span>
          <button 
            onClick={handleStartTimer}
            disabled={isPending}
            className="flex items-center gap-2 bg-primary text-primary-foreground px-4 py-2 rounded-full font-bold hover:bg-primary/90 transition-all"
          >
            <Play className="w-4 h-4" /> Iniciar Contador
          </button>
        </div>
      )}

      {playingTasks.length > 0 && (
        <div className="fixed top-6 left-1/2 -translate-x-1/2 z-50 flex flex-col gap-2">
          {playingTasks.map(task => (
            <div key={task.id} className="bg-primary text-primary-foreground shadow-lg rounded-full px-5 py-3 flex items-center gap-4 animate-in slide-in-from-top-10">
              <Clock className="w-5 h-5 animate-pulse" />
              <span className="font-medium truncate max-w-[200px]">{task.title}</span>
              <button 
                onClick={() => handlePauseTimer(task.id)}
                disabled={isPending}
                className="bg-background/20 hover:bg-background/40 p-2 rounded-full transition-colors"
              >
                <Pause className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
      )}

      <div className="flex flex-wrap items-center gap-3 mb-8 p-4 border rounded-2xl bg-card/50">
        <input 
          type="text" 
          placeholder="Buscar tareas..." 
          className="px-4 py-2 rounded-lg border bg-background flex-1 min-w-[150px] focus:outline-none focus:ring-1 focus:ring-primary"
          value={searchQuery}
          onChange={e => setSearchQuery(e.target.value)}
        />
        <select 
          className="px-4 py-2 rounded-lg border bg-background focus:outline-none focus:ring-1 focus:ring-primary"
          value={sortBy}
          onChange={e => setSortBy(e.target.value)}
        >
          <option value="manual">Ordenar: Manual (Drag&Drop)</option>
          <option value="date">Ordenar: Fecha (Más recientes)</option>
          <option value="priority">Ordenar: Prioridad</option>
        </select>
        <select 
          className="px-4 py-2 rounded-lg border bg-background focus:outline-none focus:ring-1 focus:ring-primary"
          value={priorityFilter}
          onChange={e => setPriorityFilter(e.target.value)}
        >
          <option value="all">Todas las prioridades</option>
          <option value="low">Baja</option>
          <option value="medium">Media</option>
          <option value="high">Alta</option>
          <option value="urgent">Urgente</option>
        </select>
        <select 
          className="px-4 py-2 rounded-lg border bg-background focus:outline-none focus:ring-1 focus:ring-primary"
          value={statusFilter}
          onChange={e => setStatusFilter(e.target.value)}
        >
          <option value="all">Todos los estados</option>
          <option value="todo">Pendientes</option>
          <option value="done">Completadas</option>
        </select>
        <button
          onClick={() => setEnergyFilter(f => f === 'all' ? 'low' : 'all')}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg border transition-colors font-medium ${energyFilter === 'low' ? 'bg-primary text-primary-foreground border-primary' : 'bg-background hover:bg-muted text-muted-foreground'}`}
          title="Modo Baja Energía: Ver solo tareas fáciles"
        >
          🔋 Baja Energía
        </button>
        <button
          onClick={() => setMicroTaskFilter(!microTaskFilter)}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg border transition-colors font-medium ${microTaskFilter ? 'bg-amber-500 text-white border-amber-500' : 'bg-background hover:bg-muted text-muted-foreground'}`}
          title="Micro-tareas: Ver solo tareas rápidas (5 Min)"
        >
          <Zap className="w-4 h-4" /> 5 Min
        </button>
      </div>

      <div className={`space-y-10 ${isPending ? 'opacity-50 pointer-events-none' : ''}`}>
        {Object.keys(filteredGroupedTasks).length === 0 ? (
          <div className="text-center text-muted-foreground py-10">
            No hay tareas que coincidan con los filtros.
          </div>
        ) : (
          <DragDropContext onDragEnd={onDragEnd}>
            {Object.entries(filteredGroupedTasks).map(([category, catTasks]) => (
              <Droppable key={category} droppableId={category} isDropDisabled={sortBy !== "manual"}>
                {(provided) => (
                  <div ref={provided.innerRef} {...provided.droppableProps} className="space-y-4 animate-in fade-in slide-in-from-bottom-4">
                    <h2 className="text-xl font-bold flex items-center gap-2 text-foreground/80">
                      <Folder className="w-5 h-5 text-primary" /> {category}
                      <span className="text-sm font-normal text-muted-foreground ml-2">
                        ({catTasks.filter(t => t.isCompleted).length}/{catTasks.length})
                      </span>
                    </h2>
                    <div className="space-y-3">
                      <AnimatePresence mode="popLayout">
                        {catTasks.map((task, index) => (
                          <Draggable key={task.id} draggableId={task.id.toString()} index={index} isDragDisabled={sortBy !== "manual"}>
                            {(provided, snapshot) => (
                              <div 
                                ref={provided.innerRef} 
                                {...provided.draggableProps} 
                                className={`flex items-start gap-3 rounded-2xl ${snapshot.isDragging ? 'z-50 shadow-2xl scale-[1.02] bg-background' : ''}`}
                              >
                                <div {...provided.dragHandleProps} className="mt-6 ml-2 text-muted-foreground/30 hover:text-muted-foreground transition-colors cursor-grab active:cursor-grabbing">
                                  <GripVertical className="w-5 h-5" />
                                </div>
                                <div className="mt-6">
                                  <input 
                                    type="checkbox" 
                                    className="w-5 h-5 rounded border-border text-primary cursor-pointer focus:ring-primary/50 shrink-0"
                                    checked={selectedTaskIds.has(task.id)}
                                    onChange={() => toggleSelection(task.id)}
                                  />
                                </div>
                                <div className="flex-1 min-w-0">
                                  <TaskItem task={task} allTasks={allTasks} />
                                </div>
                              </div>
                            )}
                          </Draggable>
                        ))}
                      </AnimatePresence>
                      {provided.placeholder}
                    </div>
                  </div>
                )}
              </Droppable>
            ))}
          </DragDropContext>
        )}
      </div>
    </>
  );
}
