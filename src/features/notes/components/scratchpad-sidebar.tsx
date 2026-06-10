"use client";

import { useState, useEffect, useRef } from "react";
import { updateScratchpadAction } from "../actions";
import { getTasksAction } from "@/features/tasks/actions/task.actions";
import { StickyNote, Edit3 } from "lucide-react";
import Link from "next/link";

export function ScratchpadSidebar({ initialContent }: { initialContent: string }) {
  const [content, setContent] = useState(initialContent);
  const [isSaving, setIsSaving] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [tasks, setTasks] = useState<any[]>([]);
  const [showMentions, setShowMentions] = useState(false);
  const [mentionFilter, setMentionFilter] = useState("");
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    setContent(initialContent);
    // Fetch tasks for mentions
    getTasksAction().then(setTasks);
  }, [initialContent]);

  useEffect(() => {
    if (isEditing && textareaRef.current) {
      textareaRef.current.focus();
    }
  }, [isEditing]);

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const val = e.target.value;
    setContent(val);
    
    // Check for mention trigger
    const cursorPosition = e.target.selectionStart;
    const textBeforeCursor = val.slice(0, cursorPosition);
    const match = textBeforeCursor.match(/@([a-zA-Z0-9_ ]*)$/);
    
    if (match) {
      setShowMentions(true);
      setMentionFilter(match[1].toLowerCase());
    } else {
      setShowMentions(false);
    }
    
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    
    setIsSaving(true);
    timeoutRef.current = setTimeout(async () => {
      await updateScratchpadAction(val);
      setIsSaving(false);
    }, 1000);
  };

  const handleMentionSelect = (task: any) => {
    if (!textareaRef.current) return;
    
    const cursorPosition = textareaRef.current.selectionStart;
    const textBeforeCursor = content.slice(0, cursorPosition);
    const textAfterCursor = content.slice(cursorPosition);
    
    const match = textBeforeCursor.match(/@([a-zA-Z0-9_ ]*)$/);
    if (match) {
      const startPos = match.index;
      const newTextBefore = textBeforeCursor.slice(0, startPos);
      const mentionText = `@[${task.id}](${task.title}) `;
      const newContent = newTextBefore + mentionText + textAfterCursor;
      
      setContent(newContent);
      setShowMentions(false);
      
      // Save changes
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      setIsSaving(true);
      updateScratchpadAction(newContent).then(() => setIsSaving(false));
    }
  };

  const renderContent = () => {
    if (!content.trim()) return <span className="text-muted-foreground/50">Escribe alguna idea... Haz clic para editar.</span>;
    
    const parts = content.split(/(@\[\d+\]\([^)]+\))/g);
    
    return parts.map((part, i) => {
      const match = part.match(/@\[(\d+)\]\(([^)]+)\)/);
      if (match) {
        return (
          <Link 
            key={i} 
            href={`/focus/${match[1]}`}
            onClick={(e) => e.stopPropagation()} // Prevent switching to edit mode
            className="text-primary font-medium hover:underline bg-primary/10 px-1 rounded inline-flex items-center gap-1"
          >
            {match[2]}
          </Link>
        );
      }
      return <span key={i} className="whitespace-pre-wrap">{part}</span>;
    });
  };

  const filteredTasks = tasks.filter(t => t.title.toLowerCase().includes(mentionFilter)).slice(0, 5);

  return (
    <div className="flex flex-col gap-2 p-4 pt-0 h-48 border-t border-border/50 mt-2 relative">
      <div className="flex items-center justify-between text-xs font-semibold text-muted-foreground uppercase tracking-wider mt-4">
        <div className="flex items-center gap-1">
          <StickyNote className="w-3.5 h-3.5" /> Notas Rápidas
        </div>
        {isSaving ? (
          <span className="text-[10px] animate-pulse text-primary">Guardando...</span>
        ) : (
          !isEditing && <Edit3 className="w-3 h-3 cursor-pointer hover:text-primary" onClick={() => setIsEditing(true)} />
        )}
      </div>
      
      {isEditing ? (
        <div className="relative flex-1">
          <textarea
            ref={textareaRef}
            className="w-full h-full resize-none rounded-xl border bg-card/50 p-3 text-sm outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all placeholder:text-muted-foreground/50"
            placeholder="Escribe alguna idea... (Usa @ para tareas)"
            value={content}
            onChange={handleChange}
            onBlur={() => {
              // Pequeño delay para permitir que el click en la mención funcione
              setTimeout(() => setIsEditing(false), 200);
            }}
          />
          
          {showMentions && filteredTasks.length > 0 && (
            <div className="absolute bottom-full left-0 mb-1 w-full bg-card border shadow-lg rounded-xl overflow-hidden z-50">
              {filteredTasks.map(task => (
                <div 
                  key={task.id}
                  onClick={() => handleMentionSelect(task)}
                  className="px-3 py-2 text-sm hover:bg-primary/10 cursor-pointer border-b last:border-0 truncate"
                >
                  <span className="font-medium text-foreground">{task.title}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      ) : (
        <div 
          onClick={() => setIsEditing(true)}
          className="flex-1 w-full rounded-xl border bg-card/20 p-3 text-sm overflow-y-auto cursor-text hover:bg-card/40 transition-colors"
        >
          {renderContent()}
        </div>
      )}
    </div>
  );
}
