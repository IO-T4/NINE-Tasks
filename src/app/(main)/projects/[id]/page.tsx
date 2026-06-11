import { getTasksAction, getCategoriesAction } from "@/features/tasks/actions/task.actions";
import { BoardClient } from "../../board/client";
import { TaskForm } from "@/features/tasks/components/task-form";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, FolderKanban } from "lucide-react";
import { getColorHex } from "@/lib/colors";
import { getMilestonesAction } from "@/features/milestones/actions";

export default async function ProjectBoardPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = await params;
  const categoryId = parseInt(resolvedParams.id, 10);
  
  if (isNaN(categoryId)) {
    notFound();
  }

  const categories = await getCategoriesAction();
  const category = categories.find(c => c.id === categoryId);

  if (!category) {
    notFound();
  }

  const allTasks = await getTasksAction();
  const projectTasks = allTasks.filter(t => t.categoryId === categoryId);
  const milestones = await getMilestonesAction();

  const hexColor = getColorHex(category.color);

  return (
    <div className="mx-auto w-full px-4 py-4 md:py-12 flex flex-col h-[calc(100vh-64px)] md:h-screen max-w-full">
      <header className="mb-6 flex-shrink-0">
        <div className="flex items-center gap-4 mb-4">
          <Link href="/projects" className="p-2 border rounded-xl hover:bg-muted transition-colors text-muted-foreground">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ backgroundColor: hexColor + '20', color: hexColor }}>
              <FolderKanban className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-2xl font-extrabold tracking-tight md:text-3xl">
                {category.name}
              </h1>
              <p className="text-sm text-muted-foreground">Tablero Kanban</p>
            </div>
          </div>
        </div>
        
        <div className="mt-6">
          <TaskForm categories={categories} milestones={milestones} defaultCategoryId={categoryId} />
        </div>
      </header>
      
      <div className="flex-1 min-h-0">
        <BoardClient initialTasks={projectTasks} />
      </div>
    </div>
  );
}
