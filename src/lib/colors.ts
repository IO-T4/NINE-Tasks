export const PREDEFINED_COLORS = [
  { id: "red", name: "Rojo Carmesí", value: "#dc2626", twClass: "bg-red-600" },
  { id: "orange", name: "Naranja Atardecer", value: "#ea580c", twClass: "bg-orange-600" },
  { id: "amber", name: "Ámbar Dorado", value: "#d97706", twClass: "bg-amber-600" },
  { id: "yellow", name: "Amarillo Girasol", value: "#ca8a04", twClass: "bg-yellow-600" },
  { id: "lime", name: "Lima Vibrante", value: "#65a30d", twClass: "bg-lime-600" },
  { id: "green", name: "Verde Esmeralda", value: "#16a34a", twClass: "bg-green-600" },
  { id: "emerald", name: "Verde Menta", value: "#059669", twClass: "bg-emerald-600" },
  { id: "teal", name: "Verde Azulado", value: "#0d9488", twClass: "bg-teal-600" },
  { id: "cyan", name: "Cian Océano", value: "#0891b2", twClass: "bg-cyan-600" },
  { id: "sky", name: "Cielo Despejado", value: "#0284c7", twClass: "bg-sky-600" },
  { id: "blue", name: "Azul Profundo", value: "#2563eb", twClass: "bg-blue-600" },
  { id: "indigo", name: "Índigo Noche", value: "#4f46e5", twClass: "bg-indigo-600" },
  { id: "violet", name: "Violeta Místico", value: "#7c3aed", twClass: "bg-violet-600" },
  { id: "purple", name: "Púrpura Real", value: "#9333ea", twClass: "bg-purple-600" },
  { id: "fuchsia", name: "Fucsia Neón", value: "#c026d3", twClass: "bg-fuchsia-600" },
  { id: "pink", name: "Rosa Chicle", value: "#db2777", twClass: "bg-pink-600" },
  { id: "rose", name: "Rojo Rosado", value: "#e11d48", twClass: "bg-rose-600" },
  { id: "slate", name: "Gris Pizarra", value: "#475569", twClass: "bg-slate-600" },
  { id: "gray", name: "Gris Clásico", value: "#4b5563", twClass: "bg-gray-600" },
  { id: "zinc", name: "Gris Metálico", value: "#52525b", twClass: "bg-zinc-600" },
];

export function getColorHex(id: string) {
  const color = PREDEFINED_COLORS.find(c => c.id === id);
  return color ? color.value : "#4b5563"; // Default gray
}

export function getColorClass(id: string) {
  const color = PREDEFINED_COLORS.find(c => c.id === id);
  return color ? color.twClass : "bg-gray-600";
}
