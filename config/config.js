/**
 * [整个工程的配置项]
 * @type {[type]}
 */
var fs = require( 'fs' ),
config = {
    port          :   '8080',                  // 服务端口号
    urlExtName    :   '.html',                 // url中访问的扩展名,默认.html,当然也可以改成.jsp,.php,.asp,.aspx,.do等
    VMExtName     :   '.html',                 // view model 视图文件扩展名,其它就是我们html静态文件的扩展名,默认.html
    htdocs        :   './htdocs/',             // 静态资源存放位置,默认dtdocs不建议修改,默认为好
    turnHost      :   'http://www.yjsvip.com', // 数据转发的域名。如：http://www.xxx.com:80
    turnTimeout   :   5.5                      // 转发超时条件设置 默认以秒为单位5.5秒
};

getHtmlContent( 'err404' );
getHtmlContent( 'err500' );

module.exports   = config;

function getHtmlContent( fileName ){
    fs.readFile( './config/' + fileName + '.html', function(err, data){
        
        if(err) throw new TypeError( 'config ErrPage not find!' );
        config[ fileName ] = data.toString('utf-8');
        
    });
};