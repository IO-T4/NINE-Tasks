import { neon } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-http';

// Usamos el "!" para asegurarle a TypeScript que la variable de entorno existe
const sql = neon(process.env.DATABASE_URL!);
export const db = drizzle(sql);