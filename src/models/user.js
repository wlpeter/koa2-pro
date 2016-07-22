/**
 * 用户文档
 */
'use strict'

const db = require('./index');
const mongoose = require('mongoose');
const Schema   = mongoose.Schema;

// 用户模型结构
let UserSchema = new Schema({
    iconLink:       {type: String, default: "/img/default-icon.jpg"},   // 用户图标地址
    accountID:      {type: String},                                     // 用户ID
    userName:       {type: String},                                     // 昵称
    sex:            {type: String},                                     // 性别
    loginPwd:       {type: String},                                     // 登录密码
    email:          {type: String},                                     // 邮箱
    jobType:        {type: String},                                     // 职位类型
    signs:          {type: String, default: ""},                        // 个人签名
    points:         {type: Number, default: 0},                         // 积分
    level:          {type: Number, default: 0},                         // 所属等级
    teamList:       {type: Array, default: []},                         // 所属团队ID列表
    regStap:        {type: String, default: "1"},                       // 注册完成度（1、未验证邮箱；2、完成）
    activeCode:     {type: String},                                     // 激活码
    createAt:       {type: Date, default: Date.now},                    // 创建时间
    updateAt:       {type: Date, default: Date.now}                     // 修改时间
}, { collection: 'UserModel' });

UserSchema.index({accountID: 1});

module.exports = db.model('UserModel', UserSchema, 'UserModel');
