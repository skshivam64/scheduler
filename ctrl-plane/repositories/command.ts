import pool from "../db";

const CommandRepository = {
    async createCommand(name: string, script: string) {
        return pool.query(
            "INSERT INTO commands (name, script) VALUES ($1, $2)",
            [name, script]
        );
    },

    async getCommandByName(name: string) {
        const result = await pool.query(
            "SELECT name, script FROM commands WHERE name = $1 AND is_deleted = false",
            [name]
        );
        return result.rows[0] || null;
    },

    async updateCommand(name: string, script: string) {
        const result = await pool.query(
            "UPDATE commands SET script = $1 WHERE name = $2 AND is_deleted = false RETURNING *",
            [script, name]
        );
        return result.rowCount ? result.rowCount > 0 : false;
    },

    async deleteCommand(name: string) {
        const result = await pool.query(
            "UPDATE commands SET is_deleted = true WHERE name = $1 AND is_deleted = false RETURNING *",
            [name]
        );
        return result.rowCount ? result.rowCount > 0 : false;
    },

    async listCommands() {
        const result = await pool.query(
            "SELECT name, script FROM commands WHERE is_deleted = false"
        );
        return result.rows;
    },

    async commandExists(name: string) {
        const result = await pool.query(
            "SELECT 1 FROM commands WHERE name = $1 AND is_deleted = false",
            [name]
        );
        return result.rowCount ? result.rowCount > 0 : false;
    },
};

export default CommandRepository;
