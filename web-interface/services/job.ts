import * as grpc from "@grpc/grpc-js";
import dotenv from "dotenv";

import pool from "../db";

dotenv.config({ path: "../.env" });

const JobService = {
    CreateJob: async (call: any, callback: any) => {
        let scheduleId: number;

        // Ensure id is correctly parsed as a number
        try {
            scheduleId = Number(call.request.scheduleId);
            if (isNaN(scheduleId) || scheduleId <= 0) {
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

            // Ensure the schedule exists
            const scheduleCheck = await pool.query(
                "SELECT id FROM schedules WHERE id = $1 AND is_deleted = false",
                [scheduleId]
            );
            if (scheduleCheck.rowCount === 0) {
                throw new Error("Schedule not found");
            }

            const result = await pool.query(
                "INSERT INTO jobs (schedule_id, status, scheduled_for) VALUES ($1, 'QUEUED', $2) RETURNING id, created_at",
                [scheduleId, call.request.scheduledFor]
            );

            await pool.query("COMMIT");

            callback(null, {
                id: result.rows[0].id,
                scheduleId,
                status: "QUEUED",
                createdAt: result.rows[0].created_at,
                scheduledFor: result.rows[0].scheduled_for,
            });
        } catch (err) {
            await pool.query("ROLLBACK");
            callback(err);
        }
    },

    GetJob: async (call: any, callback: any) => {
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
            const jobResult = await pool.query(
                "SELECT * FROM jobs WHERE id = $1",
                [id]
            );
            if (jobResult.rowCount === 0) {
                return callback({
                    code: grpc.status.NOT_FOUND,
                    message: "Job not found",
                });
            }

            callback(null, jobResult.rows[0]);
        } catch (err) {
            callback(err);
        }
    },

    ListJobs: async (call: any, callback: any) => {
        let { scheduleId, status } = call.request; // Get filters from request

        let query = "SELECT * FROM jobs WHERE 1=1";
        const values: any[] = [];

        // Apply schedule_id filter if provided
        if (scheduleId) {
            // Ensure id is correctly parsed as a number
            try {
                scheduleId = Number(scheduleId);
                if (isNaN(scheduleId) || scheduleId <= 0) {
                    throw new Error("Invalid id");
                }
            } catch (error) {
                return callback({
                    code: grpc.status.INVALID_ARGUMENT,
                    message: "id must be a valid integer",
                });
            }

            values.push(scheduleId);
            query += ` AND schedule_id = $${values.length}`;
        }

        // Apply status filter if provided
        if (status) {
            values.push(status);
            query += ` AND status = $${values.length}`;
        }

        try {
            const jobsResult = await pool.query(query, values);

            const jobs = jobsResult.rows.map((job: any) => ({
                id: job.id,
                scheduleId: job.schedule_id,
                status: job.status,
                error: job.error || "",
                result: job.result || "",
                scheduledFor: job.scheduled_for,
                startedAt: job.started_at,
                finishedAt: job.finished_at,
                createdAt: job.created_at,
            }));

            callback(null, { jobs });
        } catch (err) {
            callback(err);
        }
    },

    UpdateJob: async (call: any, callback: any) => {
        const { status, error, result, startedAt, finishedAt } = call.request;

        let jobId = call.request.jobId;
        // Ensure id is correctly parsed as a number
        try {
            jobId = Number(jobId);
            if (isNaN(jobId) || jobId <= 0) {
                throw new Error("Invalid id");
            }
        } catch (error) {
            return callback({
                code: grpc.status.INVALID_ARGUMENT,
                message: "id must be a valid integer",
            });
        }

        try {
            const jobCheck = await pool.query(
                "SELECT * FROM jobs WHERE id = $1",
                [jobId]
            );
            if (jobCheck.rowCount === 0) {
                return callback({
                    code: grpc.status.NOT_FOUND,
                    message: "Job not found",
                });
            }

            let query = "UPDATE jobs SET";
            const updates: string[] = [];
            const values: any[] = [];

            if (status) {
                updates.push(`status = $${values.length + 1}`);
                values.push(status);
            }

            if (error) {
                updates.push(`error = $${values.length + 1}`);
                values.push(error);
            }

            if (result) {
                updates.push(`result = $${values.length + 1}`);
                values.push(result);
            }

            if (startedAt) {
                updates.push(`started_at = $${values.length + 1}`);
                values.push(startedAt);
            }

            if (finishedAt) {
                updates.push(`finished_at = $${values.length + 1}`);
                values.push(finishedAt);
            }

            if (updates.length === 0) {
                return callback({
                    code: grpc.status.INVALID_ARGUMENT,
                    message: "At least one field must be updated",
                });
            }

            query += ` ${updates.join(", ")} WHERE id = $${
                values.length + 1
            } RETURNING *`;
            values.push(jobId);

            const updateResult = await pool.query(query, values);

            callback(null, updateResult.rows[0]);
        } catch (err) {
            callback(err);
        }
    },
};

export default JobService;
