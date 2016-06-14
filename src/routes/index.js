/**
 * Created by wanglei on 2016/06/13.
 */
'use strict'

module.exports = function (router) {
    router.get('/', (ctx) => {
        return ctx.render('index', {test: "wanglei"});
    });
}
