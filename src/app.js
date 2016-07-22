/**
 * Created by wanglei on 2016/06/13.
 */
'use strict'

const Koa = require('koa');
const path = require('path');
const views = require('koa-views');
const convert = require('koa-convert');
const serve = require('koa-static');
const koaBody = require('koa-body');
const gzip = require('koa-gzip');
const session = require('koa-session-redis3');
const router = require('koa-router')();

const app = new Koa();
const middleObj = require('./lib/middleWare.js');
// 加载配置文件
const config = require('./config/config.json');
// 加载日志
const logger = require('./lib/logger.js');
// 加载路由
const routes = require('./routes/index');
// redis初始化
require('./lib/redis.js').init(config.redis);
// 初始化数据库
require('./models/index');
routes(router);

app.keys = [config.apiService.sessionKey];

// 中间件
app
    .use(logger.middleLogger())
    .use(convert(gzip()))
    .use(serve(`${__dirname}/../public/dist`))
    .use(views(`${__dirname}/../public/views`, {map: {html: 'ejs'}}))
    .use(convert(session({store: config.redis})))
    .use(convert(koaBody({multipart: true,formidable: {keepExtensions: true}})))
    .use(middleObj.timeCheck())
    .use(router.routes(), router.allowedMethods());

// 创建服务
const server = require('http').createServer(app.callback());

// 启动消息中心
require('./lib/socket.js')(server);

// 启动监听端口
server.listen(config.apiService.port, function(){
    console.log(`Server has started, listen for ${config.apiService.port}`);
});

// 错误捕捉
server.on('error', err => {
    console.error(err);
});

module.exports = app;
