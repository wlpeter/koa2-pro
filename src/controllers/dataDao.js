/**
 * Created by wanglei on 2016/07/06.
 */
'use strict'
const _ = require("underscore");
const moment = require("moment");
const UserModel = require('../models/user');
const ArticleModel = require('../models/article');
const MessageModel = require('../models/message');
const logger = require("../lib/logger").getLogger("logic");

/**
 * ArticleModel列表查询
 * @param  param 条件
 * @param  sort  排序
 * @param  skip  查询起始位
 * @param  limit 查询长度
 */
module.exports.selectArticleList = function (param, sort, skip, limit) {
    return new Promise(function (resolve, reject) {
        let targetFields = "articleId authID title replyCount classify type address lastReply lastReplyAt isStar updateAt";
        ArticleModel.find(param, targetFields, {
            sort: sort,
            skip: skip,
            limit: limit
        }, (err, data) => {
            if (err) {
                logger.error(err);
                reject(err);
            } else {
                resolve(data);
            }
        });
    });
}

/**
 * 创建新用户信息
 * @param  saveData 新用户信息
 */
module.exports.createUser = function (saveData) {
    let userModelEntity = new UserModel(saveData);
    userModelEntity.save();
}

/**
 * 修改用户信息
 * @param  condition 条件
 * @param  param     修改参数
 */
module.exports.updateUser = function (condition, param) {
    condition = condition || {};
    return UserModel.collection.update(condition, {
        $set: param
    });
}

/**
 * 查询个人用户信息
 * @param  condition 条件
 */
module.exports.getUserInfo = function (condition) {
    return UserModel.collection.findOne(condition);
}

/**
 * 查询团队用户信息
 * @param  teamID 用户ID
 */
module.exports.getTeamInfo = function *(teamID) {
    let result = {};
    try {
        if (_.isArray(teamID)) {
            // 查询团队列表
            result = yield TeamSchema.collection.find({
                teamID: {$in: teamID}
            });
        } else {
            // 查询团队信息
            result = yield TeamSchema.collection.findOne({
                teamID: teamID
            });
        }
    } catch (e) {
        logger.error(e);
    }
    return result;
}

/**
 * 获取文章列表
 * @param  condition 条件
 * @param  page      目标页
 * @param  limit     单页查询数
 */
module.exports.getArticleList = function *(condition, page, limit) {
    limit = limit || 10;
    let param = {};
    let backParam = {
        count: 0,
        result: []
    };
    let skip = (page - 1) * limit;
    let sort = condition.other.sort || {"updateAt": -1};
    if (condition.classify) {
        param.classify = {$in: condition.classify};
    }
    if (condition.type) {
        param.type = {$in: condition.type};
    }
    if (condition.accountID) {
        param.authID = condition.accountID;
    }
    if (condition.isStar == 'false' ) {
        param.isStar = false;
    } else if ( condition.isStar == 'true' ) {
        param.isStar = true;
    }
    param.isDraft = !!condition.isDraft ? true : false;
    try {
        if (!param.authID) {
            // 获取文章总数
            backParam.count = yield ArticleModel.collection.count(param);
            if ((skip + 1) > backParam.count) {
                return backParam;
            }
        }
        // 获取文章列表
        let tmpArr = yield this.selectArticleList(param, sort, skip, limit);
        let result = [];
        let num = 0;
        for (let data of tmpArr) {
            data = data.toObject();
            let tmpData = {};
            if (data.classify == "faq" || data.classify == "team") {
                // 获取团队基本信息
                tmpData = yield this.getTeamInfo(data.authID);
                data.author = tmpData.teamName;
            } else if (data.classify == "personal") {
                // 获取个人基本信息
                tmpData = yield this.getUserInfo({"accountID": data.authID});
                data.author = tmpData.userName;
            }
            data.id = ++num;
            data.iconLink = tmpData.iconLink;
            data.lastReplyAt = moment(data.lastReplyAt).format("YYYY-MM-DD HH:mm:ss");
            data.updateAt = moment(data.updateAt).format("YYYY-MM-DD HH:mm:ss");
            data['_id'] = null;
            data.authID = null;
            result.push(data);
        }
        backParam.result = result || [];
    } catch (e) {
        logger.error(e);
    }
    return backParam;
}

/**
 * 获取消息数量
 * @param  condition 条件
 */
module.exports.getMessageCount = function (condition) {
    return MessageModel.collection.count(condition);
}
