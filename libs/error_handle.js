module.exports=server=>{
    server.use(handle_err);
}


async function handle_err(ctx,next){
    try{
      await next();  
    }catch(e){
        console.log(e);
        ctx.body = '服务器出错！！'  
    }
}