import { db } from "./src/lib/db/client";
import { attributes } from "./src/lib/db/schema";

async function main() {
  console.log("Seeding V4 Attributes...");

  const coreAttributes = [
    {
      name: "Desarrollo & Academia",
      description: "Ingeniería, estudios, código y proyectos personales.",
      color: "blue",
      icon: "Laptop",
    },
    {
      name: "Físico & Disciplina",
      description: "Kickboxing, Gimnasio, alimentación y salud.",
      color: "red",
      icon: "Dumbbell",
    },
    {
      name: "Cultura & Curiosidad",
      description: "Neografía, Mitología, Idiomas y aprendizaje por placer.",
      color: "purple",
      icon: "BookOpen",
    },
    {
      name: "Marca & Identidad",
      description: "Marca personal, directos en Twitch, customización.",
      color: "amber",
      icon: "Sparkles",
    },
    {
      name: "Ocio & Desconexión",
      description: "Anime, Manga, Videojuegos y descanso activo.",
      color: "green",
      icon: "Gamepad2",
    }
  ];

  for (const attr of coreAttributes) {
    try {
      await db.insert(attributes).values(attr);
      console.log(`✅ Seeded: ${attr.name}`);
    } catch (e) {
      console.log(`⚠️ Skipped or error: ${attr.name}`, e);
    }
  }

  console.log("Done!");
  process.exit(0);
}

main();
