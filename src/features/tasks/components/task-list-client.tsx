"use client";

import { useState } from "react";
import { TaskItem } from "./task-item";
import { Folder, Play, Pause, Clock } from "lucide-react";
import { startTimerAction, pauseTimerAction } from "@/features/time-tracker/actions";

type TaskListClientProps = {
  groupedTasks: Record<string, any[]>;
};

export function TaskListClient({ groupedTasks }: TaskListClientProps) {
  const [selectedTaskIds, setSelectedTaskIds] = useState<Set<number>>(new Set());
  const [isPending, setIsPending] = useState(false);

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
    setIsPending(true);
    await startTimerAction(Array.from(selectedTaskIds));
    setSelectedTaskIds(newSet => { newSet.clear(); return newSet; }); // Unselect after starting to clean UI
    setIsPending(false);
  };

  const handlePauseTimer = async (taskId: number) => {
    setIsPending(true);
    await pauseTimerAction([taskId]);
    setIsPending(false);
  };

  // Find if any task globally is playing right now
  const playingTasks = Object.values(groupedTasks).flat().filter(t => t.timerStatus === "playing");

  return (
    <>
      {/* Floating Action Bar for Selected Tasks */}
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

      {/* Floating Active Timers */}
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

      <div className="space-y-10">
        {Object.entries(groupedTasks).map(([category, catTasks]) => (
          <div key={category} className="space-y-4 animate-in fade-in slide-in-from-bottom-4">
            <h2 className="text-xl font-bold flex items-center gap-2 text-foreground/80">
              <Folder className="w-5 h-5 text-primary" /> {category}
              <span className="text-sm font-normal text-muted-foreground ml-2">
                ({catTasks.filter(t => t.isCompleted).length}/{catTasks.length})
              </span>
            </h2>
            <div className="space-y-3">
              {catTasks.map((task) => (
                <div key={task.id} className="flex items-center gap-3">
                  <input 
                    type="checkbox" 
                    className="w-5 h-5 rounded border-border text-primary cursor-pointer focus:ring-primary/50 shrink-0"
                    checked={selectedTaskIds.has(task.id)}
                    onChange={() => toggleSelection(task.id)}
                  />
                  <div className="flex-1 min-w-0">
                    <TaskItem task={task} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </>
  );
}
