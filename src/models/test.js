/**
 * test
 */
'user strict'
require('./index');
const assert = require('assert');
setTimeout(function () {
    const UserModel = require('./user');
     //console.log(UserModel.findOne().then(););
    //console.log(UserModel.collection.find({}));
    UserModel.findOne().then(function (data) {
        console.log(data);
    });
}, 2000);
