/**
 * Created by wanglei on 2016/06/13.
 */
'use strict'
const wrap = require('co').wrap;
const indexJob = require('../controllers/index.js');
const userJob = require('../controllers/user.js');
const middleObj = require('../lib/middleWare.js');

module.exports = function (router) {
    router.get('*', middleObj.tokenInit);
    router.get('/', wrap(indexJob.index));                                      // 首页
    router.get('/register', wrap(indexJob.registerOrLogin));                    // 显示注册页
    router.get('/login', wrap(indexJob.registerOrLogin));                       // 显示登录页
    router.post('/register', wrap(indexJob.register));                          // 注册
    router.post('/login', wrap(indexJob.login));                                // 登录
    router.get('/logout', wrap(indexJob.logout));                               // 登出
    router.get('/about', wrap(indexJob.about));                                 // 关于
    router.post('/register/reMail', wrap(indexJob.reMail));                     // 注册重发邮件
    router.get('/register/authenticate', wrap(indexJob.authenticate));          // 邮件认证
    router.get('/user/account', wrap(userJob.account));                         // 账户设置主页

    router.get('/register/captcha', wrap(indexJob.captcha));                    // 验证码图片

    router.post('/article/list', wrap(indexJob.getArticleList));                // 文章列表

    router.get('/test', wrap(indexJob.test));

    router.all('*', wrap(function *(ctx) {
        return ctx.body = "二货，你走错了！！！"
    }));
}
