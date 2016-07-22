/**
 * Created by wanglei on 2016/06/29.
 */
'use strict'

const redis = require('redis');
const Promise = require('bluebird');
const _ = require('underscore');
const logger = console || require("./logger").getLogger("common");

var redisJob = module.exports;
var client = null;

/**
 * redis初始化
 */
redisJob.init = function(config) {
    client = redis.createClient(config);
    if (client) {
        logger.info("redis初始化成功");
    } else {
        logger.error("redis初始化失败");
    }
}

/**
 * redis是否可用
 */
redisJob.useable = function() {
    if (client) {
        return true;
    }
    return false;
}

/**
 * 获取redis存储参数
 * @param  key 目标键
 * @param  cb  回调
 */
redisJob.get = function(key, cb) {
    if (!this.useable) {
        return cb('redis not init', null);
    }
    client.get(key, function(err, reply) {
        if (err) {
            logger.error("redis get error:", err);
        }
        reply = reply || null;
        if (reply && (reply.indexOf('{') == 0 || reply.indexOf('[') == 0)) {
            reply = JSON.parse(reply);
        }
        cb(err, reply);
    });
}

/**
 * 获取redis存储参数(promise版)
 * @param  key 目标键
 * @param  cb  回调
 */
redisJob.genGet = function(key) {
    let self = this;
    return new Promise(function (resolve, reject) {
        self.get(key, function (err, value) {
            if (err) {
                return reject(err);
            }
            return resolve(value);
        });
    });
}

/**
 * 存储redis存储参数
 * @param  key      目标键
 * @param  value    目标值
 * @param  time     有效时间
 * @param  cb       回调
 */
redisJob.set = function(key, value, time, cb) {
    if (!this.useable) {
        if (cb && _.isFunction(cb)) {
            cb('redis not init', null);
        }
        return;
    }
    var tmpData = value;
    if (value && Object.prototype.toString.call(value).slice(8, -1) != 'String') {
        tmpData = JSON.stringify(tmpData);
    }
    client.set(key, tmpData, function(err, reply) {
        if (err) {
            logger.error("redis save error:", err);
        } else if (time) {
            client.expire(key, time);
        }
        if (cb && _.isFunction(cb)) {
            cb(err, reply);
        }
    });
}

/**
 * 设置有效时间
 * @param  key  目标键
 * @param  secs 时间
 */
redisJob.expire = function(key , secs){
    if (!this.useable) {
        logger.error('redis not init');
    } else {
        client.expire(key, secs);
    }
}

/**
 * 发布消息
 * @param  channel 消息队列名
 * @param  value   发布内容
 */
redisJob.pub = function (channel, value) {
    var tmpData = value;
    if (value && Object.prototype.toString.call(value).slice(8, -1) != 'String') {
        tmpData = JSON.stringify(tmpData);
    }
    client.publish(channel, tmpData);
}

/**
 * 订阅消息
 * @param  channel 消息队列名
 * @param  options 连接参数
 * @param  cb      回调
 */
redisJob.sub = function (channel, options, cb) {
    options = options || {};
    var sub = redis.createClient(options);
    sub.on("message", function (channel, message) {
        logger.info(`sub channel${channel}: ${message}`);
        cb(null, message);
        sub.unsubscribe();
        sub.quit();
    });
    sub.on("error", function (err) {
        logger.error(err);
        cb(err, null);
        sub.unsubscribe();
        sub.quit();
    });
    sub.subscribe(channel);
}

/**
 * 创建redis订阅对象
 * @param  options 连接参数
 */
redisJob.create = function (options) {
    return new RedisObj(options);
}

function RedisObj(options) {
    this.redis = redis.createClient(options);
}

RedisObj.prototype = {
    subscribe: function (channel, cb) {     // 订阅
        let self = this;
        this.redis.on("message", (channel, message) => {
            cb(null, message);
        });
        this.redis.on("error", (err) => {
            console.error(err);
            cb(err, null);
            self.redis.unsubscribe();
            self.redis.quit();
        });
        this.redis.subscribe(channel);
    },
    onSub: function (cb) {                  // 监听订阅
        this.redis.on('subscribe', (channel) => {
            console.log(`redis subscribed to ${channel}`);
            cb(channel);
        });
    },
    destroy: function () {                  // 销毁
        this.redis.unsubscribe();
        this.redis.quit();
        this.redis.end(true);
    }
};
