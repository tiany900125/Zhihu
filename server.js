const Koa = require('koa');
const Router = require('koa-router');
const body = require('koa-better-body');
const convert = require('koa-convert');
const session = require('koa-session');
const config = require('./config');
const staticCache = require('koa-static-cache');
const db = require('./libs/db');
const log = require('./libs/log');
const error = require('./libs/error_handle');
const ejs = require('koa-ejs');

let server = new Koa();
//port
server.listen(config.port);


//error
error(server);
 //log
log(server);

//db
server.use(async (ctx,next)=>{
    ctx.db = db;
    await next();
});


//post
server.use(convert(body({
    uploadDir:config.uploadDir
})));

//session
server.keys= config.secret_keys;
server.use(session({},server));

//ejs
ejs(server,{
    root: 'template',
    layout: false,
    viewExt: 'ejs.html',
    cache: false,
    debug: false
})



//ROUTER
let mainRouter = new Router();
mainRouter.use('/', require('./routers/index'));
server.use(mainRouter.routes());


//静态文件
server.use(staticCache(config.wwwDir));



















