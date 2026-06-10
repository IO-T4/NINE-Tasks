"use client";

import { useState, useEffect, useTransition } from "react";
import { DragDropContext, Droppable, Draggable, DropResult } from "@hello-pangea/dnd";
import { updateTaskStatusAction } from "@/features/board/actions";
import { AlertCircle, Battery, Clock } from "lucide-react";

type BoardTask = {
  id: number;
  title: string;
  status: "todo" | "in-progress" | "done";
  priority: string;
  energyLevel: string;
  categoryName?: string | null;
  timeSpentSeconds: number;
};

const energyIcons: Record<string, { color: string, level: string }> = {
  low: { color: "text-green-500", level: "Baja" },
  medium: { color: "text-amber-500", level: "Media" },
  high: { color: "text-red-500", level: "Alta" },
};

const priorityColors: Record<string, string> = {
  low: "text-blue-500",
  medium: "text-amber-500",
  high: "text-orange-500",
  urgent: "text-destructive",
};

export function BoardClient({ initialTasks }: { initialTasks: any[] }) {
  const [tasks, setTasks] = useState<BoardTask[]>(initialTasks);
  const [isPending, startTransition] = useTransition();
  const [isBrowser, setIsBrowser] = useState(false);

  useEffect(() => {
    setIsBrowser(true);
    setTasks(initialTasks);
  }, [initialTasks]);

  const columns = {
    "todo": { title: "Pendiente", items: tasks.filter(t => t.status === "todo") },
    "in-progress": { title: "En Curso", items: tasks.filter(t => t.status === "in-progress") },
    "done": { title: "Completado", items: tasks.filter(t => t.status === "done") }
  };

  const onDragEnd = (result: DropResult) => {
    if (!result.destination) return;
    const { source, destination, draggableId } = result;

    if (source.droppableId !== destination.droppableId) {
      const taskId = Number(draggableId);
      const newStatus = destination.droppableId as "todo" | "in-progress" | "done";
      
      // Optimistic update
      setTasks(prev => prev.map(t => t.id === taskId ? { ...t, status: newStatus } : t));

      startTransition(async () => {
        await updateTaskStatusAction(taskId, newStatus);
      });
    }
  };

  if (!isBrowser) return null; // Prevent hydration mismatch with dnd

  return (
    <DragDropContext onDragEnd={onDragEnd}>
      <div className="flex gap-6 h-full overflow-x-auto pb-4 px-1">
        {(Object.entries(columns) as [keyof typeof columns, any][]).map(([columnId, column]) => (
          <div key={columnId} className="flex-shrink-0 w-80 bg-muted/30 rounded-3xl flex flex-col border">
            <div className="p-4 border-b bg-card rounded-t-3xl font-bold flex items-center justify-between">
              {column.title}
              <span className="bg-muted px-2 py-0.5 rounded-full text-xs font-semibold text-muted-foreground">
                {column.items.length}
              </span>
            </div>
            
            <Droppable droppableId={columnId}>
              {(provided, snapshot) => (
                <div
                  {...provided.droppableProps}
                  ref={provided.innerRef}
                  className={`flex-1 p-4 overflow-y-auto min-h-[150px] transition-colors ${
                    snapshot.isDraggingOver ? "bg-primary/5" : ""
                  }`}
                >
                  {column.items.map((task:any, index:number) => (
                    <Draggable key={task.id} draggableId={String(task.id)} index={index}>
                      {(provided, snapshot) => (
                        <div
                          ref={provided.innerRef}
                          {...provided.draggableProps}
                          {...provided.dragHandleProps}
                          className={`p-4 mb-3 rounded-2xl bg-card border shadow-sm group select-none transition-all
                            ${snapshot.isDragging ? "shadow-lg ring-2 ring-primary scale-105 rotate-2 cursor-grabbing" : "hover:border-primary/50 cursor-grab"}
                            ${task.status === 'done' ? "opacity-75" : ""}
                          `}
                          style={{
                            ...provided.draggableProps.style,
                          }}
                        >
                          <div className={`font-semibold mb-2 ${task.status === 'done' ? 'line-through text-muted-foreground' : ''}`}>
                            {task.title}
                          </div>
                          
                          <div className="flex items-center gap-3 text-sm mt-3">
                            {task.categoryName && (
                              <span className="text-xs bg-muted px-2 py-1 rounded-md">{task.categoryName}</span>
                            )}
                            
                            <span title={`Prioridad: ${task.priority}`}>
                               <AlertCircle className={`w-4 h-4 shrink-0 ${priorityColors[task.priority] || "text-muted-foreground"}`} />
                            </span>
                            
                            {task.energyLevel && (
                              <span title={`Energía Requerida: ${energyIcons[task.energyLevel]?.level}`} className="flex items-center">
                                <Battery className={`w-4 h-4 shrink-0 ${energyIcons[task.energyLevel]?.color || "text-muted-foreground"}`} />
                              </span>
                            )}

                            {task.timeSpentSeconds > 0 && (
                              <span className="ml-auto text-xs font-mono text-muted-foreground flex items-center gap-1">
                                <Clock className="w-3 h-3" />
                                {Math.floor(task.timeSpentSeconds / 60)}m
                              </span>
                            )}
                          </div>
                        </div>
                      )}
                    </Draggable>
                  ))}
                  {provided.placeholder}
                </div>
              )}
            </Droppable>
          </div>
        ))}
      </div>
    </DragDropContext>
  );
}
