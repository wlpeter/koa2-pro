/**
 * Created by wanglei on 2016/06/13.
 */
'use strict'
const wrap = require('co').wrap;
const indexJob = require('../controllers/index.js');

module.exports = function (router) {
    router.get('/', wrap(indexJob.index));
}
