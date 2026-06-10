'use client';

import { useState } from 'react';
import { createTaskAction } from '../actions/task.actions';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Plus, Loader2, Tag, AlertCircle, Calendar, Battery } from 'lucide-react';

export function TaskForm({ categories = [] }: { categories?: any[] }) {
  const [title, setTitle] = useState('');
  const [priority, setPriority] = useState<"low"|"medium"|"high"|"urgent">('medium');
  const [energyLevel, setEnergyLevel] = useState<"low"|"medium"|"high">('medium');
  const [categoryId, setCategoryId] = useState<number | ''>('');
  const [dueDate, setDueDate] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    setIsLoading(true);
    const catId = categoryId === '' ? null : Number(categoryId);
    const parsedDate = dueDate ? new Date(dueDate) : null;
    const result = await createTaskAction(title, priority, energyLevel, catId, parsedDate);

    if (result.success) {
      setTitle(''); 
      setDueDate('');
    }
    setIsLoading(false);
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-3 mb-8 p-5 rounded-2xl bg-card border shadow-sm">
      <div className="flex w-full items-center gap-3">
        <Input
          type="text"
          placeholder="¿Qué necesitas hacer hoy?"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          disabled={isLoading}
          className="flex-1 px-5 py-6 text-lg rounded-xl bg-background/50 border-border focus-visible:ring-primary/30"
        />
        <Button 
          type="submit" 
          disabled={isLoading || !title.trim()}
          className="py-6 px-6 rounded-xl gap-2 font-semibold transition-all hover:scale-[1.02] active:scale-[0.98]"
        >
          {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Plus className="w-5 h-5" />}
          <span className="hidden sm:inline">Añadir</span>
        </Button>
      </div>
      
      <div className="flex flex-wrap gap-4 px-1 mt-1">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Tag className="w-4 h-4" />
          <select 
            className="bg-transparent outline-none focus:text-foreground cursor-pointer"
            value={categoryId}
            onChange={(e) => setCategoryId(e.target.value as any)}
            disabled={isLoading}
          >
            <option value="">Sin Categoría</option>
            {categories.map(c => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
        </div>
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <AlertCircle className="w-4 h-4" />
          <select 
            className="bg-transparent outline-none focus:text-foreground cursor-pointer"
            value={priority}
            onChange={(e) => setPriority(e.target.value as any)}
            disabled={isLoading}
          >
            <option value="low">Baja</option>
            <option value="medium">Media</option>
            <option value="high">Alta</option>
            <option value="urgent">Urgente</option>
          </select>
        </div>
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Battery className="w-4 h-4" />
          <select 
            className="bg-transparent outline-none focus:text-foreground cursor-pointer"
            value={energyLevel}
            onChange={(e) => setEnergyLevel(e.target.value as any)}
            disabled={isLoading}
          >
            <option value="low">Energía Baja</option>
            <option value="medium">Energía Media</option>
            <option value="high">Energía Alta</option>
          </select>
        </div>
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Calendar className="w-4 h-4" />
          <input 
            type="date"
            className="bg-transparent outline-none focus:text-foreground cursor-pointer font-sans"
            value={dueDate}
            onChange={(e) => setDueDate(e.target.value)}
            disabled={isLoading}
          />
        </div>
      </div>
    </form>
  );
}