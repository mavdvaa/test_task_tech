import { Pool } from "pg";
console.log(process.env.DATABASE_URL);
export const db = new Pool({
  connectionString: process.env.DATABASE_URL,
});