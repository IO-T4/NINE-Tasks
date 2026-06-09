import { getTasksAction, getCategoriesAction } from './actions/task.actions';
import { TaskForm } from './components/task-form';
import { TaskListClient } from './components/task-list-client';
import { ThemeToggle } from '@/components/theme-toggle';
import { LogOut, Folder, LayoutDashboard, CheckCircle2 } from 'lucide-react';
import { logoutAction } from '@/features/auth/actions';

export async function TasksView() {
  const tasks = await getTasksAction();
  const categories = await getCategoriesAction();

  // Dashboard Stats
  const totalTasks = tasks.length;
  const completedTasks = tasks.filter(t => t.isCompleted).length;
  const progressPercent = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

  // Group tasks by category
  const groupedTasks = tasks.reduce((acc, task) => {
    const catName = task.categoryName || 'Sin Categoría';
    if (!acc[catName]) acc[catName] = [];
    acc[catName].push(task);
    return acc;
  }, {} as Record<string, typeof tasks>);

  return (
    <div className="max-w-4xl mx-auto w-full px-4 py-12 md:py-16">
      <header className="mb-10 border-b pb-8 border-border/40 relative">
        <div className="absolute top-0 right-0 flex gap-3">
          <ThemeToggle />
          <form action={logoutAction}>
            <button
              type="submit"
              className="p-2 rounded-full border bg-card hover:bg-destructive/10 transition-colors text-muted-foreground hover:text-destructive shadow-sm"
              title="Cerrar sesión"
            >
              <LogOut className="h-4 w-4" />
            </button>
          </form>
        </div>
        <h1 className="text-4xl font-extrabold tracking-tighter text-foreground md:text-5xl mt-2">
          NINE <span className="text-muted-foreground font-light">Tasks</span>
        </h1>
        <p className="text-xl text-muted-foreground mt-3 max-w-prose font-light">
          Gestiona tus tareas diarias y proyectos.
        </p>
      </header>

      {/* Dashboard Analítico */}
      <section className="mb-12 grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="p-5 rounded-2xl border bg-card shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-primary/10 text-primary flex items-center justify-center">
            <LayoutDashboard className="w-6 h-6" />
          </div>
          <div>
            <p className="text-sm text-muted-foreground font-medium">Total Tareas</p>
            <p className="text-2xl font-bold">{totalTasks}</p>
          </div>
        </div>
        <div className="p-5 rounded-2xl border bg-card shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-green-500/10 text-green-500 flex items-center justify-center">
            <CheckCircle2 className="w-6 h-6" />
          </div>
          <div>
            <p className="text-sm text-muted-foreground font-medium">Completadas</p>
            <p className="text-2xl font-bold">{completedTasks}</p>
          </div>
        </div>
        <div className="p-5 rounded-2xl border bg-card shadow-sm flex flex-col justify-center">
          <div className="flex justify-between items-center mb-2">
            <p className="text-sm text-muted-foreground font-medium">Progreso Global</p>
            <span className="text-sm font-bold text-primary">{progressPercent}%</span>
          </div>
          <div className="w-full bg-muted rounded-full h-2.5 overflow-hidden">
            <div className="bg-primary h-2.5 rounded-full transition-all duration-1000" style={{ width: `${progressPercent}%` }}></div>
          </div>
        </div>
      </section>

      <section className="mb-12">
        <TaskForm categories={categories} />
      </section>

      <section>
        {Object.keys(groupedTasks).length === 0 ? (
          <div className="text-center text-muted-foreground py-16 px-6 border-2 border-dashed rounded-3xl border-border/60 bg-muted/20 animate-in fade-in duration-500">
            <p className="text-lg font-medium">No tienes tareas pendientes.</p>
            <p className="text-sm mt-1">¡Añade tu primer proyecto o tarea!</p>
          </div>
        ) : (
          <TaskListClient groupedTasks={groupedTasks} />
        )}
      </section>
    </div>
  );
}