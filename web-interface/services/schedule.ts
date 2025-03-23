import * as grpc from "@grpc/grpc-js";
import { Empty } from "google-protobuf/google/protobuf/empty_pb";
import dotenv from "dotenv";

import pool from "../db";

dotenv.config({ path: "../.env" });

const ScheduleService = {
    CreateSchedule: async (call: any, callback: any) => {
        const { commandName, crontab, params } = call.request;
        try {
            await pool.query("BEGIN");

            const result = await pool.query(
                "INSERT INTO schedules (command_name, crontab) VALUES ($1, $2) RETURNING id",
                [commandName, crontab]
            );

            const scheduleId = result.rows[0].id;
            if (params.length > 0) {
                const values = params
                    .map((param: string) => `(${scheduleId}, '${param}')`)
                    .join(", ");
                await pool.query(
                    `INSERT INTO params (schedule_id, value) VALUES ${values}`
                );
            }

            await pool.query("COMMIT");
            callback(null, new Empty());
        } catch (err) {
            await pool.query("ROLLBACK");
            callback(err);
        }
    },

    DeleteSchedule: async (call: any, callback: any) => {
        let id: number;

        // Ensure id is correctly parsed as a number
        try {
            id = Number(call.request.id);
            if (isNaN(id) || id <= 0) {
                throw new Error("Invalid id");
            }
        } catch (error) {
            return callback({
                code: grpc.status.INVALID_ARGUMENT,
                message: "id must be a valid integer",
            });
        }

        try {
            await pool.query("BEGIN");
            await pool.query("DELETE FROM params WHERE schedule_id = $1", [id]);
            await pool.query("DELETE FROM schedules WHERE id = $1", [id]);
            await pool.query("COMMIT");
            callback(null, new Empty());
        } catch (err) {
            await pool.query("ROLLBACK");
            callback(err);
        }
    },

    ListSchedules: async (call: any, callback: any) => {
        try {
            const schedulesResult = await pool.query("SELECT * FROM schedules");
            const schedules = await Promise.all(
                schedulesResult.rows.map(async (schedule: any) => {
                    const paramsResult = await pool.query(
                        "SELECT value FROM params WHERE schedule_id = $1",
                        [schedule.id]
                    );
                    return {
                        id: schedule.id,
                        commandName: schedule.command_name,
                        crontab: schedule.crontab,
                        params: paramsResult.rows.map((row: any) => row.value),
                    };
                })
            );

            callback(null, { schedules });
        } catch (err) {
            callback(err);
        }
    },
};

export default ScheduleService;
