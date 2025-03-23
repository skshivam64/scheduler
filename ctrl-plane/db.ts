import { Pool } from "pg";
import dotenv from "dotenv";

dotenv.config();

const pool = new Pool({
    user: process.env.DB_USER,
    host: process.env.DB_HOST,
    database: process.env.DB_NAME,
    password: process.env.DB_PASSWORD,
    port: Number(process.env.DB_PORT),
});

pool.on("connect", () => {
    console.log("✅ Connected to the PostgreSQL database");
});

pool.on("error", (err: any) => {
    console.error("❌ PostgreSQL error:", err);
    process.exit(1);
});

export default pool;
