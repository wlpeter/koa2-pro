/**
 * Created by wanglei on 2016/05/26.
 */
'use strict'

const log4js = require('koa-log4');
const logConfig = require('../config/config.json').logger;

// 日志功能初始化
log4js.configure(logConfig);

/**
 * 日志中间件
 */
function middleLogger () {
    return log4js.koaLogger(log4js.getLogger('common'), {
        level: 'auto',
        format: ':method :url'
    });
}

/**
 * 获取日志对象
 *
 * @param  namespace 命名空间
 * @return 日志对象
 */
function getLogger (namespace) {
    return log4js.getLogger(namespace);
}

module.exports = {
    middleLogger: middleLogger,
    getLogger: getLogger
};
