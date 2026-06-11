"use client";

import { useState, useEffect, useTransition, useRef } from "react";
import { Play, Pause, Square, CheckCircle2, ChevronLeft, Volume2, VolumeX } from "lucide-react";
import { useRouter } from "next/navigation";
import { updateTaskTimeAction, updateTaskAction } from "@/features/tasks/actions/task.actions";
import { motion, AnimatePresence } from "framer-motion";

export function FocusSessionClient({ task, categories = [], milestones = [] }: { task: any, categories?: any[], milestones?: any[] }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [isActive, setIsActive] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [seconds, setSeconds] = useState(task.timeSpentSeconds || 0);
  const [title, setTitle] = useState(task.title);
  const [description, setDescription] = useState(task.description || "");
  const [priority, setPriority] = useState(task.priority || "low");
  const [energy, setEnergy] = useState(task.energyLevel || "low");
  const [categoryId, setCategoryId] = useState<number | "">(task.categoryId || "");
  const [milestoneId, setMilestoneId] = useState<number | "">(task.milestoneId || "");
  const [dueDate, setDueDate] = useState<string>(
    task.dueDate ? new Date(task.dueDate).toISOString().split("T")[0] : ""
  );

  const [soundEnabled, setSoundEnabled] = useState(false);
  const audioCtxRef = useRef<AudioContext | null>(null);
  const noiseNodeRef = useRef<AudioBufferSourceNode | null>(null);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isActive) {
      interval = setInterval(() => {
        setSeconds((s: number) => s + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isActive]);

  // Ambient sound logic (Rain/Brown noise simulation)
  useEffect(() => {
    if (soundEnabled && isActive) {
      if (!audioCtxRef.current) {
        audioCtxRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
      }
      const ctx = audioCtxRef.current;
      
      const bufferSize = ctx.sampleRate * 2; 
      const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
      const output = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        const white = Math.random() * 2 - 1;
        output[i] = (lastOut + (0.02 * white)) / 1.02;
        lastOut = output[i];
        output[i] *= 3.5; 
      }
      
      const source = ctx.createBufferSource();
      source.buffer = buffer;
      source.loop = true;

      const filter = ctx.createBiquadFilter();
      filter.type = "lowpass";
      filter.frequency.value = 400;

      const gain = ctx.createGain();
      gain.gain.value = 0.5;

      source.connect(filter);
      filter.connect(gain);
      gain.connect(ctx.destination);
      
      source.start();
      noiseNodeRef.current = source;
      
    } else {
      if (noiseNodeRef.current) {
        noiseNodeRef.current.stop();
        noiseNodeRef.current.disconnect();
        noiseNodeRef.current = null;
      }
    }
    
    return () => {
      if (noiseNodeRef.current) {
        noiseNodeRef.current.stop();
        noiseNodeRef.current.disconnect();
        noiseNodeRef.current = null;
      }
    };
  }, [soundEnabled, isActive]);

  let lastOut = 0;

  const handleSaveAndExit = () => {
    setIsActive(false);
    startTransition(async () => {
      await updateTaskTimeAction(task.id, seconds);
      router.back();
    });
  };

  const handleSaveDetails = () => {
    setIsEditing(false);
    startTransition(async () => {
      const catId = categoryId === "" ? null : Number(categoryId);
      const mId = milestoneId === "" ? null : Number(milestoneId);
      const parsedDate = dueDate ? new Date(dueDate) : null;
      
      await updateTaskAction(task.id, {
        title,
        description,
        priority,
        energyLevel: energy,
        categoryId: catId,
        milestoneId: mId,
        dueDate: parsedDate ? parsedDate.toISOString() : null,
      });
    });
  };

  const formatTime = (totalSecs: number) => {
    const h = Math.floor(totalSecs / 3600);
    const m = Math.floor((totalSecs % 3600) / 60);
    const s = totalSecs % 60;
    if (h > 0) return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  return (
    <div className="fixed inset-0 z-[100] bg-zinc-950 flex flex-col items-center justify-center p-4 transition-colors duration-1000 overflow-hidden">
      {/* Zen Animated Background */}
      <AnimatePresence>
        {isActive && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 2 }}
            className="absolute inset-0 z-0 flex items-center justify-center pointer-events-none"
          >
            <motion.div 
              className="w-[80vmin] h-[80vmin] rounded-full bg-primary/5 blur-[100px]"
              animate={{ 
                scale: [1, 1.2, 1],
                opacity: [0.3, 0.6, 0.3]
              }}
              transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
            />
          </motion.div>
        )}
      </AnimatePresence>

      <div className="relative z-10 w-full max-w-7xl mx-auto flex justify-between absolute top-8 px-8">
        <button 
          onClick={handleSaveAndExit}
          disabled={isPending}
          className="p-3 bg-zinc-900 border-zinc-800 border rounded-2xl hover:bg-zinc-800 transition-colors flex items-center gap-2 text-zinc-300"
        >
          <ChevronLeft className="w-5 h-5" /> Salir y Guardar
        </button>

        <button 
          onClick={() => setSoundEnabled(!soundEnabled)}
          className={`p-3 border rounded-2xl transition-colors flex items-center gap-2 ${
            soundEnabled 
              ? "bg-primary text-primary-foreground border-primary" 
              : "bg-zinc-900 border-zinc-800 text-zinc-400 hover:text-zinc-200"
          }`}
          title="Sonido Ambiental"
        >
          {soundEnabled ? <Volume2 className="w-5 h-5" /> : <VolumeX className="w-5 h-5" />}
        </button>
      </div>

      <div className="relative z-10 max-w-2xl w-full text-center space-y-12 mt-12">
        <div className="space-y-4">
          <span className="text-primary font-bold tracking-widest uppercase bg-primary/10 px-4 py-1.5 rounded-full text-sm">
            Focus Mode
          </span>
          {!isActive && isEditing ? (
            <div className="space-y-4 mt-6 animate-in fade-in slide-in-from-top-4 bg-zinc-900/50 p-6 rounded-3xl border border-zinc-800/50 backdrop-blur-xl">
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full text-3xl font-extrabold tracking-tighter text-white bg-transparent border-b border-zinc-800 focus:border-primary outline-none text-center pb-2 transition-colors"
                placeholder="Título de la tarea"
                autoFocus
              />
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full text-lg text-zinc-400 bg-transparent border-b border-zinc-800 focus:border-primary outline-none text-center pb-2 resize-none transition-colors"
                placeholder="Añade una descripción..."
                rows={2}
              />
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm text-left pt-2">
                <div>
                  <label className="text-zinc-500 block mb-1">Prioridad</label>
                  <select 
                    value={priority} 
                    onChange={(e) => setPriority(e.target.value)}
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-xl p-2 text-zinc-300 outline-none focus:border-primary"
                  >
                    <option value="low">Baja</option>
                    <option value="medium">Media</option>
                    <option value="high">Alta</option>
                    <option value="urgent">Urgente</option>
                  </select>
                </div>
                <div>
                  <label className="text-zinc-500 block mb-1">Energía</label>
                  <select 
                    value={energy} 
                    onChange={(e) => setEnergy(e.target.value)}
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-xl p-2 text-zinc-300 outline-none focus:border-primary"
                  >
                    <option value="low">Baja</option>
                    <option value="medium">Media</option>
                    <option value="high">Alta</option>
                  </select>
                </div>
                <div>
                  <label className="text-zinc-500 block mb-1">Fecha Límite</label>
                  <input 
                    type="date"
                    value={dueDate}
                    onChange={(e) => setDueDate(e.target.value)}
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-xl p-2 text-zinc-300 outline-none focus:border-primary [color-scheme:dark]"
                  />
                </div>
                <div>
                  <label className="text-zinc-500 block mb-1">Categoría</label>
                  <select 
                    value={categoryId} 
                    onChange={(e) => setCategoryId(e.target.value as any)}
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-xl p-2 text-zinc-300 outline-none focus:border-primary"
                  >
                    <option value="">Sin Categoría</option>
                    {categories.map((c) => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                  </select>
                </div>
                <div className="col-span-2 md:col-span-1">
                  <label className="text-zinc-500 block mb-1">Meta</label>
                  <select 
                    value={milestoneId} 
                    onChange={(e) => setMilestoneId(e.target.value as any)}
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-xl p-2 text-zinc-300 outline-none focus:border-primary"
                  >
                    <option value="">Sin Meta</option>
                    {milestones.map((m) => (
                      <option key={m.id} value={m.id}>{m.title}</option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="flex justify-center gap-4 pt-4">
                <button 
                  onClick={() => setIsEditing(false)}
                  className="px-6 py-2 rounded-xl text-zinc-400 hover:text-white transition-colors"
                >
                  Cancelar
                </button>
                <button 
                  onClick={handleSaveDetails}
                  disabled={isPending}
                  className="px-6 py-2 rounded-xl bg-primary text-primary-foreground hover:bg-primary/90 transition-colors font-bold"
                >
                  {isPending ? "Guardando..." : "Guardar Cambios"}
                </button>
              </div>
            </div>
          ) : (
            <div 
              className={`mt-6 ${!isActive ? "cursor-pointer hover:opacity-80 transition-opacity" : ""}`}
              onClick={() => !isActive && setIsEditing(true)}
              title={!isActive ? "Haz clic para editar" : ""}
            >
              <h1 className="text-4xl md:text-6xl font-extrabold tracking-tighter balance-text text-white">
                {title}
              </h1>
              {description && (
                <p className="text-xl text-zinc-400 mt-4">{description}</p>
              )}
              {!isActive && !isEditing && (
                <div className="mt-4 text-sm text-zinc-500 flex items-center justify-center gap-2">
                  <span>Haz clic en el texto para editar</span>
                </div>
              )}
            </div>
          )}
        </div>

        <div className="text-8xl md:text-9xl font-black font-mono tracking-tighter tabular-nums bg-gradient-to-b from-white to-zinc-500 bg-clip-text text-transparent drop-shadow-2xl">
          {formatTime(seconds)}
        </div>

        <div className="flex flex-wrap justify-center gap-4">
          <button
            onClick={() => setIsActive(!isActive)}
            disabled={isPending}
            className={`w-24 h-24 rounded-full flex items-center justify-center shadow-[0_0_40px_rgba(0,0,0,0.5)] transition-all hover:scale-105 active:scale-95 ${
              isActive 
                ? 'bg-amber-500 hover:bg-amber-600 text-white shadow-amber-500/20' 
                : 'bg-primary hover:bg-primary/90 text-primary-foreground shadow-primary/20'
            }`}
          >
            {isActive ? <Pause className="w-10 h-10" /> : <Play className="w-10 h-10 ml-2" />}
          </button>
        </div>
        
        <p className="text-zinc-400 font-medium">
          {isActive ? "Modo enfoque activo. Inhala profundo." : "Pausado. Presiona play para continuar."}
        </p>
      </div>
    </div>
  );
}
