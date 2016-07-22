/**
 * Created by wanglei on 2016/07/07.
 */
'use strict'

const socket = require('socket.io');
const Promise = require('bluebird');
const querystring = require('querystring');
const logger = require("./logger").getLogger("common");
const redis = require("./redis");
const config = require('../config/config.json').redis;
const userJob = require("../controllers/user");

/**
 * socket初始化
 */
module.exports =  function(server) {
    let io = socket(server);
    io.use((socket, next) => {
        // 用户认证
        authCheck(socket.handshake.headers.cookie, flg => {
            flg ? next() : next(new Error('Authentication error'));
        });
    });
    io.on('connection', socket => {
        let ssid = querystring.parse(socket.handshake.headers.cookie, '; ', '=').ssid;
        let timeStamp = socket.handshake.query.timeStamp;
        let redisObj = redis.create(config);
        redisObj.onSub((channel) => {
            // 消息初始化
            userJob.noticeInit(channel);
        });
        // 订阅消息
        redisObj.subscribe(ssid, (err, data) => {
            socket.emit(`${ssid}#${timeStamp}`, data);
        });
        socket.on('error', (err) => {
            console.log(err);
        });
        socket.on('disconnect', () => {
            redisObj.destroy();
            console.log("OVER");
        });
    });
}

/**
 * 访问认证
 * @param  cookies
 */
function authCheck(cookies, cb) {
    cookies = cookies || '';
    let cookiesObj = querystring.parse(cookies, '; ', '=');
    if (!cookies || !cookiesObj.token || !cookiesObj['koa:sess'] || !cookiesObj.ssid) {
        return cb(false);
    }
    redis.get(cookiesObj['koa:sess'], (err, data) => {
        data = data || {};
        if (data.accountID == cookiesObj.ssid) {
            cb(true);
        } else {
            cb(false);
        }
    });

}
