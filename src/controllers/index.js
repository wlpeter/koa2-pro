/**
 * Created by wanglei on 2016/06/13.
 */
'use strict'

const _ = require("underscore");
const crypto = require("crypto");
const uuid = require("node-uuid");
const logger = require("../lib/logger").getLogger("logic");
const mailJob = require("../lib/email");
const captcha = require("../lib/captcha");

const appSecret = require('../config/config.json').safe.appSecret;
const webSite = require('../config/config.json').apiService.website;

const dao = require("./dataDao.js");

/**
 * 发送邮件
 * @param  param    参数
 * @param  tryTime  尝试次数（默认不填为0）
 */
function sendMail(param, tryTime) {
    tryTime = tryTime || 0;
    let activeCode = ancrypt("aes-256-cbc", appSecret, param.activeCode);
    let link = `${webSite}/register/authenticate?activeCode=${activeCode}`;
    let html = `<h1>欢迎加入makerRoom</h1><h3>请点击如下激活地址:</h3><a href="${link}">${link}</a><br/><p>如果上面不是链接形式，请将地址复制到您的浏览器(例如chrome)的地址栏再访问.</p>`;
    let subject = "[makerRoom]注册账号激活邮件";
    mailJob.sendMail(param.email, subject, html).then(info => {
        logger.info(info);
    }).catch(err => {
        logger.error(err);
        if (tryTime > 0) {
            // 重发邮件
            sendMail(param, --tryTime);
        }
    });
    return activeCode;
}

/**
 * 加密
 * @param  cipher 加密算法
 * @param  key    秘钥
 * @param  str    待加密字符串
 */
function ancrypt(cipher, key, str) {
    let cipherObj = crypto.createCipher(cipher, key);
    let crypted = cipherObj.update(str,'utf8','hex');
    crypted += cipherObj.final('hex');
    return crypted;
}

/**
 * 解密
 * @param  cipher  加密算法
 * @param  key     秘钥
 * @param  crypted 加密字符串
 */
function decrypt(cipher, key, crypted) {
    let decipher = crypto.createDecipher(cipher,key);
    let dec = decipher.update(crypted,'hex','utf8');
    dec += decipher.final('utf8');
    return dec;
}

/**
 * 注册或登录请求参数验证
 * @param  type  验证类型（login：登录；register：注册）
 * @param  param 请求参数
 */
function regOrLogCheck(type, param, session) {
    param = param || {};
    let message = "";
    let mailFormat = /^([a-zA-Z0-9]+[_|\_|\.]?)*[a-zA-Z0-9]+@([a-zA-Z0-9]+[_|\_|\.]?)*[a-zA-Z0-9]+\.[a-zA-Z]{2,3}$/;
    if (type == "login") {
        if (!param.email || !mailFormat.test(param.email) || !param.password || param.password.length < 6) {
            throw {code: "1001",msg: "账户或密码填写错误"};
        }
    } else {
        if (!param.email || !param.password || !param.rePassword || !param.checkCode || !param.ruleCheck) {
            throw {code: "1001",msg: "信息填写错误"};
        } else if (!mailFormat.test(param.email)) {
            throw {code: "1001",msg: "邮箱格式错误"};
        } else if (param.password != param.rePassword) {
            throw {code: "1001",msg: "密码不一致"};
        } else if (param.password.length < 6) {
            throw {code: "1001",msg: "密码不得少于6位"};
        } else if (param.checkCode.toLowerCase() != session.captcha.toLowerCase()) {
            throw {code: "1001",msg: "验证码错误"};
        }
    }
    return;
}


/**
 * @name 首页
 */
module.exports.index = function *(ctx) {
    console.log(ctx.sessionId);
    console.log(ctx.cookies.get('koa:sess'));
    let resultData = {
        active: {
            title: "新站上线送福利",
            description: "2016.06.22~2016.08.22期间注册用户，即可送2000积分，先到先得！！"
        },
        userInfo: {
            userName: ctx.session.userName || ''
        }
    }
    yield ctx.render('index', resultData);
}

/**
 * @name 关于
 */
module.exports.about = function *(ctx) {
    let resultData = {
        userInfo: {
            userName: ctx.session.userName || ''
        }
    }
    yield ctx.render('about', resultData);
}


/**
 * @name 注册与登录页面显示
 */
module.exports.registerOrLogin = function *(ctx) {
    let param = {
        userInfo: {},
        errorMessage:""
    };
    if (ctx.session.accountID) {
        return ctx.redirect('/');
    } else if (ctx.request.url.indexOf('register') > -1) {
        param.type = "register";
    } else {
        param.type = "login";
    }
    yield ctx.render('regOrLogin', param);
}

/**
 * @name 登出
 */
module.exports.logout = function*(ctx) {
    let param = {
        userInfo: {}
    };
    ctx.session = null;
    ctx.cookies.set('ssid', null, {
        path: '/',
        signed: false
    });
    return ctx.redirect('/');
}

/**
 * @name 登录
 */
module.exports.login = function*(ctx) {
    let result = {
        userInfo: {},
        errorMessage:"",
        type:"login"
    };
    try {
        if (ctx.session.accountID) {
            return ctx.redirect('/');
        }
        let param = ctx.request.body;
        // 参数认证
        regOrLogCheck("login", param);
        // 查询对应账户
        let accountData = yield dao.getUserInfo({email: param.email});
        // 密码加密
        param.password = ancrypt("aes-256-cbc", appSecret, param.password);
        if (_.isEmpty(accountData) || accountData.loginPwd != param.password) {
            throw {code:"1002", msg:"账户或密码错误."};
        } else if (accountData.regStap != '2') { // 判断是否已验证邮箱
            result.result = {
                statusCode: "MK002",
                activeCode:  ancrypt("aes-256-cbc", appSecret, accountData.activeCode)
            };
            return ctx.render('notice', result);
        }
        ctx.session.userName = accountData.userName;
        ctx.session.email = accountData.email;
        ctx.session.accountID = accountData.accountID;
        ctx.cookies.set('ssid', accountData.accountID, {
            path: '/',
            signed: false,
            maxAge: 60 * 60 * 1000,
            httpOnly: false
        });
    } catch (e) {
        logger.error(e.msg || e);
        result.errorMessage = e.msg || "系统错误,请稍后尝试.";
        return ctx.render('regOrLogin', result);
    }
    return ctx.redirect('/');
}

/**
 * @name 注册
 */
module.exports.register = function*(ctx) {
    let backParam = {
        userInfo: {},
        errorMessage:"",
        type:"register"
    };
    try {
        if (ctx.session.accountID) {
            return ctx.redirect('/');
        }
        let postParam = ctx.request.body;
        // 参数认证
        regOrLogCheck("register", postParam, ctx.session);
        // 验证邮箱是否存在
        let result = yield dao.getUserInfo({email: postParam.email});
        if (result) {
            throw {code:"1001", msg:"邮箱已存在！"};
        }
        // 待存储参数
        let saveData = {
            userName: postParam.email,
            accountID: uuid.v1(),
            loginPwd: ancrypt("aes-256-cbc", appSecret, postParam.password),
            email: postParam.email,
            activeCode: uuid.v4()
        };
        // 存储用户信息
        dao.createUser(saveData);
        backParam.result = {
            statusCode: "MK001",
            activeCode: sendMail(saveData, 2) || "" // 发送邮件
        };
    } catch (e) {
        logger.error(e);
        backParam.errorMessage = e.msg || "系统错误,请稍后重试."
        return ctx.render('regOrLogin', backParam);
    }
    return ctx.render('notice', backParam);
}

/**
 * @name 重发邮件
 */
module.exports.reMail = function*(ctx) {
    try {
        let param = ctx.request.body;
        if (!param || !param.activeCode) {
            throw {code:"1001", msg:"参数有误"};
        }
        // 解密
        let activeCode = decrypt("aes-256-cbc", appSecret, param.activeCode);
        // 查询对应账户信息
        let result = yield dao.getUserInfo({"activeCode": activeCode});
        if (_.isEmpty(result)) {
            throw {code:"1002", msg:"未找到对应邮箱"};
        }
        // 发送邮件
        sendMail({"activeCode": activeCode, "email": result.email}, 2);
    } catch (e) {
        logger.error(e.msg || e);
        return ctx.body = e.code ? e : {code: "1000", msg: "系统错误，请稍后重试"};
    }
    return ctx.body = {code: "0000", msg: "再次发送成功"};
}

/**
 * @name 邮件认证
 */
module.exports.authenticate = function*(ctx) {
    let query = ctx.query;
    let result = {
        userInfo: {}
    };
    try {
        if (!query || !query.activeCode) {
            throw {code: "1001", msg: "参数有误"};
        }
        // 解密
        let activeCode = decrypt("aes-256-cbc", appSecret, query.activeCode);
        // 查询对应账户信息
        let accountData = yield dao.getUserInfo({"activeCode": activeCode});
        if (_.isEmpty(accountData)) {
            throw {code: "1002", msg: "未找到对应账号"};
        }
        // 更新用户信息为注册完成
        yield dao.updateUser({"accountID": accountData.accountID}, {
            regStap: '2',
            activeCode: '',
            updateAt: new Date()
        });
        result.result = {statusCode: "MK003"};
    } catch (e) {
        logger.error(e.msg || e);
        result.result = {statusCode: "MK004"};
    }
    return ctx.render('notice', result);
}

/**
 * @name 文章列表接口
 */
module.exports.getArticleList = function *(ctx) {
    logger.info("获取文章列表");
    let result = [];
    let condition = ctx.request.body.condition;
    let page = condition.other.page || 1;
    let limit = condition.other.limit || 10;
    if (condition.accountID) {
        condition.accountID = ctx.session.accountID;
    }

    result = yield dao.getArticleList(condition, page, limit);
    logger.info("获取文章列表成功");
    return ctx.body = result;
}

/**
 * @name 生成验证码图片
 */
module.exports.captcha = function *(ctx) {
    // 生成验证码
    let result = captcha.getCheckCode();
    ctx.session.captcha = result[0];
    return ctx.body = result[1];
}

// 测试接口
module.exports.test = function *(ctx) {
    yield ctx.render('notice', {
        userInfo: {},
        errorMessage:"",
        type:"register",
        result: {
            statusCode: "MK001",
            activeCode: "testCode"
        }
    });
}
