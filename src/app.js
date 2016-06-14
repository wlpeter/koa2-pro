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
const router = require('koa-router')();

const app = new Koa();
// 加载配置文件
const config = require('./config/config.json');
// 加载日志
const logger = require('./lib/logger.js');
// 加载路由
const routes = require('./routes/index');
routes(router);

app.keys = [config.apiService.sessionKey];

// 中间件
app
    .use(logger.middleLogger())
    .use(serve(`&{__dirname}/../public/dist`))
    .use(views(`&{__dirname}/../public/views`, {map: {html: 'ejs'}}))
    .use(router.routes(), router.allowedMethods())
    .use(convert(koaBody({multipart: true,formidable: {keepExtensions: true}})));

// 启动监听端口
app.listen(config.apiService.port, function(){
    console.log(`Server has started, listen for ${config.apiService.port}`);
});

// 错误捕捉
app.on('error', err => {
    console.error(err);
});

module.exports = app;
