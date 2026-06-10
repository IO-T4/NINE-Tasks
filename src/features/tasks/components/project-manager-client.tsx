"use client";

import { useState } from "react";
import { createCategoryAction, updateCategoryAction, deleteCategoryAction } from "../actions/task.actions";
import { FolderKanban, Plus, Trash2, Edit2, Check, X, Loader2 } from "lucide-react";

type ProjectManagerClientProps = {
  categories: any[];
  tasks: any[];
};

export function ProjectManagerClient({ categories, tasks }: ProjectManagerClientProps) {
  const [isCreating, setIsCreating] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [name, setName] = useState("");
  const [color, setColor] = useState("blue");
  const [isPending, setIsPending] = useState(false);

  const colors = ["blue", "red", "green", "purple", "orange", "yellow", "pink", "indigo"];

  const handleCreate = async () => {
    if (!name.trim()) return;
    setIsPending(true);
    await createCategoryAction(name, color);
    setName("");
    setColor("blue");
    setIsCreating(false);
    setIsPending(false);
  };

  const handleUpdate = async (id: number) => {
    if (!name.trim()) return;
    setIsPending(true);
    await updateCategoryAction(id, name, color);
    setEditingId(null);
    setName("");
    setColor("blue");
    setIsPending(false);
  };

  const handleDelete = async (id: number) => {
    setIsPending(true);
    await deleteCategoryAction(id);
    setIsPending(false);
  };

  const startEdit = (cat: any) => {
    setEditingId(cat.id);
    setName(cat.name);
    setColor(cat.color);
    setIsCreating(false);
  };

  const cancelEdit = () => {
    setEditingId(null);
    setIsCreating(false);
    setName("");
    setColor("blue");
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-bold">Tus Proyectos</h2>
        <button 
          onClick={() => { setIsCreating(true); setEditingId(null); setName(""); setColor("blue"); }}
          className="flex items-center gap-2 bg-primary text-primary-foreground px-4 py-2 rounded-xl text-sm font-bold hover:bg-primary/90 transition-all"
        >
          <Plus className="w-4 h-4" /> Nuevo Proyecto
        </button>
      </div>

      {(isCreating || editingId !== null) && (
        <div className="p-6 border rounded-3xl bg-card shadow-sm animate-in fade-in slide-in-from-top-4">
          <h3 className="font-bold mb-4">{isCreating ? "Crear Proyecto" : "Editar Proyecto"}</h3>
          <div className="space-y-4">
            <input 
              type="text" 
              placeholder="Nombre del proyecto..."
              className="w-full px-4 py-3 rounded-xl border bg-background focus:outline-none focus:ring-2 focus:ring-primary/50"
              value={name}
              onChange={(e) => setName(e.target.value)}
              disabled={isPending}
            />
            <div className="flex flex-wrap gap-3">
              {colors.map(c => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setColor(c)}
                  className={`w-8 h-8 rounded-full border-2 transition-all ${color === c ? 'border-foreground scale-110' : 'border-transparent hover:scale-110'} bg-${c}-500`}
                />
              ))}
            </div>
            <div className="flex justify-end gap-3 mt-4">
              <button 
                onClick={cancelEdit}
                disabled={isPending}
                className="px-4 py-2 rounded-xl bg-muted text-muted-foreground hover:bg-muted/80 transition-colors"
              >
                Cancelar
              </button>
              <button 
                onClick={isCreating ? handleCreate : () => handleUpdate(editingId!)}
                disabled={isPending || !name.trim()}
                className="flex items-center gap-2 px-4 py-2 rounded-xl bg-primary text-primary-foreground hover:bg-primary/90 transition-colors"
              >
                {isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
                Guardar
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {categories.length === 0 && !isCreating ? (
          <div className="col-span-full text-center py-16 px-6 border-2 border-dashed rounded-3xl bg-muted/20">
            <FolderKanban className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-lg font-medium text-muted-foreground">No tienes proyectos.</p>
          </div>
        ) : (
          categories.map(cat => {
            const projectTasks = tasks.filter(t => t.categoryId === cat.id);
            const completedTasks = projectTasks.filter(t => t.isCompleted).length;
            const progress = projectTasks.length > 0 ? Math.round((completedTasks / projectTasks.length) * 100) : 0;
            const isCompleted = cat.isCompleted || (projectTasks.length > 0 && completedTasks === projectTasks.length);

            return (
              <div key={cat.id} className={`p-6 border rounded-3xl bg-card shadow-sm transition-all group ${isCompleted ? 'opacity-60 grayscale' : 'hover:border-primary/50'}`}>
                <div className="flex justify-between items-start mb-4">
                  <div className="flex items-center gap-3">
                    <div className={`w-4 h-4 rounded-full bg-${cat.color}-500`} />
                    <h2 className={`text-xl font-bold ${isCompleted ? 'line-through' : ''}`}>{cat.name}</h2>
                  </div>
                  <div className="opacity-0 group-hover:opacity-100 transition-opacity flex gap-2">
                    <button onClick={() => startEdit(cat)} className="text-muted-foreground hover:text-foreground">
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button onClick={() => handleDelete(cat.id)} className="text-muted-foreground hover:text-destructive">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between text-sm text-muted-foreground">
                    <span>{completedTasks} / {projectTasks.length} tareas</span>
                    <span>{progress}%</span>
                  </div>
                  <div className="w-full bg-muted rounded-full h-2 overflow-hidden">
                    <div className={`h-2 rounded-full transition-all bg-${cat.color}-500`} style={{ width: `${progress}%` }} />
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
