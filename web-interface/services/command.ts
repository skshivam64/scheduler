import * as grpc from "@grpc/grpc-js";
import pool from "../db";
import { Empty } from "google-protobuf/google/protobuf/empty_pb";

import dotenv from "dotenv";

dotenv.config({ path: "../.env" });

const CommandService = {
    CreateCommand: async (call: any, callback: any) => {
        const { name, script } = call.request;
        try {
            await pool.query(
                "INSERT INTO commands (name, script) VALUES ($1, $2)",
                [name, script]
            );
            callback(null, new Empty());
        } catch (err) {
            callback(err);
        }
    },

    GetCommand: async (call: any, callback: any) => {
        const { name } = call.request;
        try {
            const result = await pool.query(
                "SELECT name, script FROM commands WHERE name = $1 AND is_deleted = false",
                [name]
            );
            if (result.rows.length > 0) {
                callback(null, result.rows[0]);
            } else {
                callback({
                    code: grpc.status.NOT_FOUND,
                    message: "Command not found",
                });
            }
        } catch (err) {
            callback(err);
        }
    },

    UpdateCommand: async (call: any, callback: any) => {
        const { name, script } = call.request;
        try {
            await pool.query(
                "UPDATE commands SET script = $1 WHERE name = $2 AND is_deleted = false",
                [script, name]
            );
            callback(null, new Empty());
        } catch (err) {
            callback(err);
        }
    },

    DeleteCommand: async (call: any, callback: any) => {
        const { name } = call.request;
        try {
            await pool.query(
                "UPDATE commands SET is_deleted = true WHERE name = $1",
                [name]
            );
            callback(null, new Empty());
        } catch (err) {
            callback(err);
        }
    },

    ListCommands: async (call: any, callback: any) => {
        try {
            const result = await pool.query(
                "SELECT name, script FROM commands WHERE is_deleted = false"
            );
            callback(null, { commands: result.rows });
        } catch (err) {
            callback(err);
        }
    },
};

export default CommandService;
