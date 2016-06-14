/**
 * Created by wanglei on 2016/06/13.
 */
'use strict'

module.exports.index = function *(ctx) {
    yield ctx.render('index', {test: "wanglei"});
}
