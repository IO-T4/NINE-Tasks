import { getTasksAction } from './actions/task.actions';
import { TaskForm } from './components/task-form';

export async function TasksView() {
  // Obtenemos las tareas directamente desde el servidor (cero tiempos de carga en el cliente)
  const tasks = await getTasksAction();

  return (
    <div className="max-w-2xl mx-auto w-full">
      <div className="mb-8 text-center md:text-left">
        <h2 className="text-3xl font-bold tracking-tight">Mis Tareas</h2>
        <p className="text-muted-foreground mt-2">Gestiona tu día de forma eficiente.</p>
      </div>

      {/* Aquí inyectamos el formulario que acabamos de crear */}
      <TaskForm />

      {/* Lista de tareas */}
      <div className="space-y-3">
        {tasks.length === 0 ? (
          <p className="text-center text-muted-foreground py-10 border rounded-xl border-dashed">
            No tienes tareas pendientes. ¡Buen trabajo!
          </p>
        ) : (
          tasks.map((task) => (
            <div
              key={task.id}
              className="p-4 rounded-xl border bg-card text-card-foreground shadow-sm flex justify-between items-center"
            >
              <span className={task.isCompleted ? "line-through text-muted-foreground" : "font-medium"}>
                {task.title}
              </span>
              {/* Aquí irán los botones de completar/borrar más adelante */}
            </div>
          ))
        )}
      </div>
    </div>
  );
}