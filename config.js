const pathlib = require('path');

module.exports={
    port: 8081,
    //upload
    uploadDir: pathlib.resolve('www/upload'),
    //WWW
    wwwDir: pathlib.resolve('www'),
    //LOG
    logDir: pathlib.resolve('log/access.log'),

    //secret
    secret_keys: ['xasdasdasdasdasd','dadadadaafsgfgdffsdw','jjsdasjdhasf'],


    //db
    db_host:'localhost',
    db_user:'root',
    db_password:'admin',
    db_port:'3306',
    db_database:'zhihu',
}