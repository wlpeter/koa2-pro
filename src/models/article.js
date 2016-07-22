/**
 * 文章文档
 */
'use strict'

const db = require('./index');
const mongoose = require('mongoose');
const Schema   = mongoose.Schema;

// 定义文章模型结构
let ArticleSchema = new Schema({
    articleId:      {type: Schema.Types.ObjectId},          // 主键ID
    authID:         {type: String},                         // 作者ID/团队ID
    title:          {type: String},                         // 标题
    replyCount:     {type: Number, default: 0},             // 回复次数
    classify:       {type: String},                         // 作者分类
    type:           {type: String},                         // 文章类型
    address:        {type: String},                         // 链接地址
    lastReply:      {type: String, default: ""},            // 最近回复者昵称
    lastReplyAt:    {type: Date, default: Date.now },       // 最近回复时间
    isStar:         {type: Boolean, default: false},        // 是否加精
    isDraft:        {type: Boolean, default: true},         // 是否为草稿
    content:        {type: String},                         // 文章内容test
    createAt:       {type: Date, default: Date.now },       // 创建时间
    updateAt:       {type: Date, default: Date.now }        // 修改时间
}, { collection: 'ArticleModel' });

ArticleSchema.index({articleId: 1});
ArticleSchema.index({authID: 1});

module.exports = db.model('ArticleModel', ArticleSchema, 'ArticleModel');
