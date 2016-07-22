/**
 * Created by wanglei on 2016/05/26.
 */
'use strict'

const ccap = require('ccap');

const captcha = ccap({
    width: 100,                 // 图片宽度
    height: 40,                 // 图片高度
    offset: 25,                 // 字体间距
    quality: 80,                // 图片质量
    fontsize: 30,               // 字体大小
    generate: function() {      // code生成器
        let chars = 'ABCDEFGHJKMNPQRSTWXYZabcdefhijkmnprstwxyz0123456789';
        let maxPos = chars.length;
        let code = '';
        for (let i = 0; i < 4; i++) {
            code += chars.charAt(Math.floor(Math.random() * maxPos));
        }
        return code;
    }
});

/**
 * 获取验证码
 */
function getCheckCode() {
    return captcha.get();
}

module.exports = {
    getCheckCode: getCheckCode
};
