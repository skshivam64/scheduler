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
        CREATE INDEX "schedules_command_name_idx" ON "schedules" ("command_name");
        CREATE INDEX "params_schedule_id_idx" ON "params" ("schedule_id");
    `);
};

exports.down = function (db) {
    return db.runSql(`
        DROP INDEX "schedules_command_name_idx";
        DROP INDEX "params_schedule_id_idx";
    `);
};

exports._meta = {
    version: 1,
};
