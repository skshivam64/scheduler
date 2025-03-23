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
        ALTER TABLE commands ADD COLUMN is_deleted BOOLEAN DEFAULT FALSE;
        ALTER TABLE schedules ADD COLUMN is_deleted BOOLEAN DEFAULT FALSE;
    `);
};

exports.down = function (db) {
    return db.runSql(`
        ALTER TABLE commands DROP COLUMN is_deleted;
        ALTER TABLE schedules DROP COLUMN is_deleted;
    `);
};

exports._meta = {
    version: 1,
};
