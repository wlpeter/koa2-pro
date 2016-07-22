/**
 * 消息文档
 */
'use strict'

const db = require('./index');
const mongoose = require('mongoose');
const Schema   = mongoose.Schema;

// 定义消息模型结构
let MessageSchema = new Schema({
    masterId:       {type: Schema.Types.ObjectId},          // 主键ID
    articleId:      {type: Schema.Types.ObjectId},          // 文章ID
    sendID:         {type: String},                         // 发送者ID
    recID:          {type: String},                         // 接受者ID（0：所有用户，其他为对应团队或个人）
    status:         {type: String, default: 0},             // 状态（-1：删除；0：未读；1：已读；）
    content:        {type: String},                         // 消息内容
    createAt:       {type: Date, default: Date.now },       // 创建时间
    updateAt:       {type: Date, default: Date.now }        // 修改时间
}, { collection: 'MessageModel' });

MessageSchema.index({masterId: 1, articleId: 1, sendID: 1, recID: 1});

module.exports = db.model('MessageModel', MessageSchema, 'MessageModel');
