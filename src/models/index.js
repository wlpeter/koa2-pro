/**
 * mongodb初始化操作
 */
'user strict'

const mongoose = require('mongoose');
const config = require("../config/config.json");
const logger = require("../lib/logger").getLogger("common");
const _ = require("underscore");
const Promise = require("bluebird");

// 连接数据库
var db = mongoose.createConnection(config.mongodb.uri, _.extend({
    promiseLibrary: Promise
}, config.mongodb.options || {}));

db.on('error', function(err) {
    logger.error('MongoDB连接错误: ', err.message || err);
    process.exit(1);
});

db.once('open', function() {
    logger.info('MongoDB连接成功.');
});

module.exports = db;
