import { getTasksAction } from './actions/task.actions';
import { TaskForm } from './components/task-form';

export async function TasksView() {
  const tasks = await getTasksAction();

  return (
    // CAMBIO 1: Contenedor más elegante, con ancho limitado y márgenes superiores/inferiores generosos.
    <div className="max-w-3xl mx-auto w-full px-4 py-12 md:py-16">

      {/* CAMBIO 2: Cabecero con mejor jerarquía. Título más grande, subtítulo más sutil y separación mayor del contenido. */}
      <header className="mb-12 border-b pb-8 border-border/40">
        <h1 className="text-4xl font-extrabold tracking-tighter text-foreground md:text-5xl">
          NINE <span className="text-muted-foreground font-light">Tasks</span>
        </h1>
        <p className="text-xl text-muted-foreground mt-3 max-w-prose font-light">
          Gestiona tus tareas diarias con simplicidad y claridad visual.
        </p>
      </header>

      {/* Sección del formulario: Mayor separación hacia abajo. */}
      <section className="mb-12">
        <TaskForm />
      </section>

      {/* Sección de la lista de tareas. */}
      <section>
        <div className="space-y-5">
          {tasks.length === 0 ? (
            // CAMBIO 4: Empty state más "limpio". Usamos un borde discontinuo muy sutil y color muted.
            <div className="text-center text-muted-foreground py-16 px-6 border-2 border-dashed rounded-3xl border-border/60 bg-muted/20">
              <p className="text-lg font-medium">No tienes tareas pendientes.</p>
              <p className="text-sm mt-1">¡Buen trabajo! Disfruta de tu tiempo libre o añade una nueva.</p>
            </div>
          ) : (
            tasks.map((task) => (
              // CAMBIO 3: La Tarjeta de Tarea. Detalles que la hacen profesional:
              // - Bordes muy redondeados (rounded-2xl)
              // - Fondo 'bg-card' (usualmente blanco puro o gris muy sutil en shadcn)
              // - Sombra levísima (shadow-sm) y borde fino (border)
              // - Espaciado interior cómodo (p-5)
              <div
                key={task.id}
                className="group p-5 rounded-2xl border bg-card text-card-foreground shadow-sm flex items-center gap-4 transition-all duration-300 hover:border-border/80 hover:shadow-md"
              >
                {/* Placeholder para el Checkbox (aún no funcional) */}
                <div className="w-6 h-6 rounded-full border-2 border-muted-foreground/30 group-hover:border-primary/50 transition-colors" />

                <div className="flex-1">
                  <span className={`text-lg transition-all ${task.isCompleted ? "line-through text-muted-foreground/60 font-light" : "font-semibold text-foreground/90"}`}>
                    {task.title}
                  </span>

                  {/* Detalles extra (aunque no lo definimos, drizzle lo guarda): fecha de creación. Esto da profesionalidad. */}
                  <span className="block text-xs text-muted-foreground/70 mt-1 font-mono">
                    Añadida: {task.createdAt.toLocaleDateString('es-ES', { day: 'numeric', month: 'short' })}
                  </span>
                </div>

                {/* Botón placeholder para 'Borrar' (aún no funcional, solo visual) */}
                <button className="text-muted-foreground/40 hover:text-destructive transition-colors text-sm font-medium px-3 py-1 rounded-md">
                  Eliminar
                </div>
              </div>
            ))
          )}
        </div>
      </section>
    </div>
  );
}