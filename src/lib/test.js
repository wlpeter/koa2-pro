'use strict'

/*const mailJob = require("./email.js");

mailJob.sendMail(
    "443703662@qq.com",
    "makeRoom激活邮件2",
    '<h1>欢迎注册1</h1><h3>请点击如下激活地址1：</h3><a href="www.baidu.com">www.baidu.com</a>'
).then(data => {
    console.log("++++++++++++++++++++++++++++");
    console.log(data);
}).catch(err => {
    console.log("++++++++++++++++++++++++++++");
    console.error(err);
});*/
var redis = require("redis");
var redisJob = require("./redis.js");
var pub = redis.createClient();
var msg_count = 0;

/*redisJob.sub("a nice channel", {}, function (err, data) {
    console.log("++++++++++++++++++++++++++++1");
    console.log(err);
    console.log(data);
});
redisJob.sub("a nice channel", {}, function (err, data) {
    console.log("++++++++++++++++++++++++++++2");
    console.log(err);
    console.log(data);
});*/
setTimeout(function () {
    pub.publish("2f1c2f80-3dda-11e6-93f7-c18a63bda98f", "3");
}, 3000);
