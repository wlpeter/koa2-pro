/**
 * Created by wanglei on 2016/05/26.
 */
'use strict'
const uuid = require("node-uuid");

module.exports.tokenInit = function (ctx, next) {
    if (!ctx.session.token) {
        ctx.session.token = uuid.v1();
    }
    return next().then(() => {
        if (ctx.session) {
            let token = ctx.session.token;
            if (token != ctx.cookies.get('token')) {
                ctx.cookies.set('token', token, {
                    signed: true,
                    maxAge: 60 * 60 * 1000,
                    httpOnly: true
                });
            }
        }
    });
}

/**
 * 记录接口访问时间
 */
module.exports.timeCheck = function () {
    return function (ctx, next) {
        console.time(ctx.request.url);
        return next().then(() => {
            console.timeEnd(ctx.request.url);
        });
    }
}
