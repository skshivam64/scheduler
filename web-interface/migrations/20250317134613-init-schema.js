"use strict";

var dbm;
var type;
var seed;

/**
 * We receive the dbmigrate dependency from dbmigrate initially.
 * This enables us to not have to rely on NODE_PATH.
 */
exports.setup = function (options, seedLink) {
    dbm = options.dbmigrate;
    type = dbm.dataType;
    seed = seedLink;
};

exports.up = function (db) {
    return db.runSql(`
        CREATE TYPE "job_status" AS ENUM (
            'QUEUED',
            'RUNNING',
            'COMPLETED',
            'FAILED'
        );

        CREATE TABLE "commands" (
            "name" varchar PRIMARY KEY,
            "function_body" text,
            "is_deleted" boolean DEFAULT false,
            "created_at" timestamp DEFAULT (now())
        );

        CREATE TABLE "schedules" (
            "id" bigserial PRIMARY KEY,
            "command_name" varchar,
            "crontab" varchar,
            "is_deleted" boolean DEFAULT false,
            "created_at" timestamp DEFAULT (now())
        );

        CREATE TABLE "jobs" (
            "id" bigserial PRIMARY KEY,
            "schedule_id" bigint,
            "status" job_status DEFAULT 'QUEUED',
            "error" varchar,
            "is_deleted" boolean DEFAULT false,
            "started_at" timestamp,
            "finished_at" timestamp,
            "created_at" timestamp DEFAULT (now())
        );

        ALTER TABLE "schedules" ADD FOREIGN KEY ("command_name") REFERENCES "commands" ("name");

        ALTER TABLE "jobs" ADD FOREIGN KEY ("schedule_id") REFERENCES "schedules" ("id");
    `);
};

exports.down = function (db) {
    return db.runSql(`
        DROP TABLE jobs;
        DROP TABLE schedules;
        DROP TABLE commands;
        DROP TYPE job_status;
  `);
};

exports._meta = {
    version: 1,
};
