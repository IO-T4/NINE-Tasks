import { getCategoriesAction, getTasksAction } from "@/features/tasks/actions/task.actions";
import { ProjectManagerClient } from "@/features/tasks/components/project-manager-client";

export default async function ProjectsPage() {
  const categories = await getCategoriesAction();
  const tasks = await getTasksAction();

  return (
    <div className="max-w-4xl mx-auto w-full px-4 py-4 md:py-12">
      <header className="mb-10 border-b pb-8 border-border/40">
        <h1 className="text-3xl font-extrabold tracking-tight md:text-4xl">
          Proyectos
        </h1>
        <p className="text-lg text-muted-foreground mt-2 font-light">
          Administra tus categorías y proyectos.
        </p>
      </header>
      
      <ProjectManagerClient categories={categories} tasks={tasks} />
    </div>
  );
}
