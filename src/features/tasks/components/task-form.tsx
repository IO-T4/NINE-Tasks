'use client'; // Esto es un componente de cliente porque tiene interactividad (el usuario escribe)

import { useState } from 'react';
import { createTaskAction } from '../actions/task.actions';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

export function TaskForm() {
  const [title, setTitle] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    setIsLoading(true);
    const result = await createTaskAction(title);

    if (result.success) {
      setTitle(''); // Limpiamos el input si todo va bien
    }
    setIsLoading(false);
  };

  return (
    <form onSubmit={handleSubmit} className="flex w-full items-center space-x-2 mb-8">
      <Input
        type="text"
        placeholder="¿Qué necesitas hacer hoy?"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        disabled={isLoading}
        className="flex-1" // Ocupa todo el espacio disponible
      />
      <Button type="submit" disabled={isLoading || !title.trim()}>
        {isLoading ? 'Guardando...' : 'Añadir'}
      </Button>
    </form>
  );
}