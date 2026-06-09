import { getCategoriesAction, createCategoryAction } from "@/features/tasks/actions/task.actions";
import { FolderKanban } from "lucide-react";

export default async function ProjectsPage() {
  const categories = await getCategoriesAction();

  return (
    <div className="max-w-4xl mx-auto w-full px-4 py-8 md:py-12">
      <header className="mb-10 border-b pb-8 border-border/40">
        <h1 className="text-3xl font-extrabold tracking-tight md:text-4xl">
          Proyectos
        </h1>
        <p className="text-lg text-muted-foreground mt-2 font-light">
          Administra tus categorías y proyectos.
        </p>
      </header>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {categories.length === 0 ? (
          <div className="col-span-full text-center py-16 px-6 border-2 border-dashed rounded-3xl bg-muted/20">
            <FolderKanban className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-lg font-medium text-muted-foreground">No tienes proyectos.</p>
          </div>
        ) : (
          categories.map(cat => (
            <div key={cat.id} className="p-6 border rounded-3xl bg-card shadow-sm hover:border-primary/50 transition-colors">
              <h2 className="text-xl font-bold">{cat.name}</h2>
              <div className={`mt-4 w-4 h-4 rounded-full bg-${cat.color}-500`} />
            </div>
          ))
        )}
      </div>
    </div>
  );
}
