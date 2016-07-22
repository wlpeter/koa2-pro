/**
 * Created by wanglei on 2016/06/28.
 */
'use strict'

const nodeMailer = require('nodemailer');
const Promise = require("bluebird");
const mailOpts = require("../config/config.json").email;

/**
 * 发送邮件
 * @param  address 收件人
 * @param  subject 标题
 * @param  html    邮件文本
 */
function sendMail(address, subject, html) {
    return new Promise(function (resolve, reject) {
        let transport = nodeMailer.createTransport({
            host: mailOpts.host,
            port: 465,
            secureConnection: true,
            auth: {
                user: mailOpts.user,
                pass: mailOpts.pass
            },
            logger: true
        });
        transport.sendMail({
            from: mailOpts.user,
            to: address,
            subject: subject,
            html: html
        }, function (err, info) {
            if (err) {
                reject(err);
            } else {
                resolve(info);
            }
        });
    });
}

module.exports = {
    sendMail: sendMail
}
