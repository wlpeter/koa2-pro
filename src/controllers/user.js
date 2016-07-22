/**
 * Created by wanglei on 2016/07/06.
 */
'use strict'

const _ = require("underscore");
const crypto = require("crypto");
const uuid = require("node-uuid");
const moment = require("moment");
const logger = require("../lib/logger").getLogger("logic");
const redis = require("../lib/redis");

const appSecret = require('../config/config.json').safe.appSecret;
const webSite = require('../config/config.json').apiService.website;

const dao = require("./dataDao.js");


/**
 * @name 账户设置
 */
module.exports.account = function *(ctx) {
    if (!ctx.session.accountID) {
        return ctx.redirect('/login');
    }
    let result = {
        userInfo: {userName: ctx.session.userName},
        userPart: {},
        teamPart: {},
        pageType: "overview"
    };
    // 获取用户基本信息
    let userInfo = yield dao.getUserInfo({accountID: ctx.session.accountID});
    let teamInfo = [];
    if (userInfo.teamIDList && userInfo.teamIDList.length > 0) {
        // 获取团队基本信息
        teamInfo = yield dao.getTeamInfo(userInfo.teamIDList);
        result.teamPart = {

        };
    }
    // 用户栏
    result.userPart = {
        iconLink: userInfo.iconLink,
        userName: userInfo.userName,
        userLevel: getUserLevel(userInfo.level),
        sex: userInfo.sex || "未填写",
        points: userInfo.points,
        userJob: userInfo.jobType || "未填写",
        signs: userInfo.signs || "太懒了，啥都没写！！！"
    }
    yield ctx.render('account',  result);
}


/**
 * @name 消息初始化
 */
module.exports.noticeInit = function (authID) {
    if (authID) {
        return redis.pub(authID, 0);
    }
    let condition = {
        recID: authID,
        status: 0
    };
    // 获取未读消息数量
    dao.getMessageCount(condition).then((data) => {
        redis.pub(authID, data)
    }).catch((err) => {
        console.log(err);
        redis.pub(authID, 0);
    });
}

/**
 * 用户等级
 * @param  level 等级数值
 */
function getUserLevel(level) {
    let result = "";
    if (level < 5) {
        result = "IT猪";
    } else if (level < 100) {
        result = "码字猴";
    } else if (level < 1000) {
        result = "网管猿";
    } else if (level < 10000) {
        result = "程序猿";
    } else if (level < 20000) {
        result = "攻城狮";
    } else if (level < 30000) {
        result = "极客狗";
    } else if (level <= 50000) {
        result = "搬砖家";
    } else if (level > 50000) {
        result = "大叫兽";
    }
    return result;
}
