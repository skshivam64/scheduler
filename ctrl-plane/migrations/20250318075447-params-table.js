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
        CREATE TABLE "params" (
            "id" bigserial PRIMARY KEY,
            "schedule_id" bigint,
            "value" varchar,
            "created_at" timestamp DEFAULT (now())
        );

        ALTER TABLE "params" ADD FOREIGN KEY ("schedule_id") REFERENCES "schedules" ("id");
    `);
};

exports.down = function (db) {
    return db.runSql(`DROP TABLE "params";`);
};

exports._meta = {
    version: 1,
};
