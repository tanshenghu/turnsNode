/**
◎ *@Description: node server 优点(亮点) 1.支持include语法(N个页面共用一套header头部footer尾部等等) 2.可玩点新花样改路由扩展名,如:http://www.abc.com/index.jsp别人以为你的是jsp页面，其实是静态页面 3.可以写一些自己的controller,用于前期工作自己模拟假数据,如果想调真实数据也可以哦,第四点就是. 4.支持数据转发,我们可以用这个node做数据转发达到跨域请求数据的效果,详细看demo。说到跨域很多前端同学可能第一想到jsonp，可知jsonp是否能满我们所有场景需求，jsonp是否也有缺点?答案是肯定的!
◎ *@Author: 谭生虎       TanShenghu    TSH    
◎ *@Update: 2016-11-11
◎ *@Contact: ☎：13588428548        Email: tanshenghu@163.com    QQ：511568692
◎ *@AuthorNote: 请不要随意改核心文件，另外请尽量不要用js中的严格模式，严格模式会把js某些功能阉割掉倒置报错，文件提供给大家学习参考或者项目中运用。后期会有一些优化、迭代、bug fixed等最新node代码请关注Git
◎ *@Git: http://git.oschina.net/tanshenghu/myweb/tree/nodeServer
*/
var 
http   = require( 'http' ),
config = require( './config/config' ),
app    = http.createServer()
.listen( config.port );

require( './core/__main__' )( app );

console.log( '\033[32mhttp服务 ---> http://127.0.0.1:'+ config.port +', 已启动成功^_^\033[0m' );