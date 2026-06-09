import { neon } from '@neondatabase/serverless';
import * as dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

async function main() {
  try {
    const sql = neon(process.env.DATABASE_URL);
    
    await sql`ALTER TABLE "sessions" DROP COLUMN IF EXISTS "user_id" CASCADE;`;
    await sql`DROP TABLE IF EXISTS "users" CASCADE;`;
    console.log('Successfully dropped columns and tables.');
  } catch (error) {
    console.error('Error:', error);
  }
}

main();
