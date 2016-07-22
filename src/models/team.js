/**
 * 团队文档
 */
'use strict'

const db = require('./index');
const mongoose = require('mongoose');
const Schema   = mongoose.Schema;

// 团队模型结构
let TeamSchema = new Schema({
    iconLink:       {type: String, default: "/img/default-icon.jpg"},   // 团队图标地址
    teamID:         {type: String},                                     // 团队ID
    teamName:       {type: String},                                     // 昵称
    jobType:        {type: String},                                     // 职责类型
    signs:          {type: String, default: ""},                        // 团队签名
    level:          {type: Number, default: 0},                         // 所属等级
    regStap:        {type: String, default: "1"},                       // 团队申请完成度（1、未完成；2、完成）
    makerID:        {type: String},                                     // 团队创建者ID
    managerOneID:   {type: String},                                     // 团队管理员一ID
    managerTwoID:   {type: String},                                     // 团队管理员二ID
    managerThreeID: {type: String},                                     // 团队管理员三ID
    //specifications: {type: String},                                     // 团队规格()
    createAt:       {type: Date, default: Date.now},                    // 创建时间
    updateAt:       {type: Date, default: Date.now}                     // 修改时间
}, { collection: 'TeamModel' });

TeamSchema.index({teamID: 1});

module.exports = db.model('TeamModel', TeamSchema, 'TeamModel');
