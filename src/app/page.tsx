import { TasksView } from "@/features/tasks/tasks.view";

export default function Home() {
  return (
    <main className="min-h-screen p-4 md:p-8 flex flex-col items-center justify-center bg-background">
      <TasksView />
    </main>
  );
}