var 
fs       = require( 'fs' ),
path     = require( 'path' ),
url      = require( 'url' ),
Config   = require( '../config/config' ),
htdocs   = Config.htdocs + '/',
fileType = require( './filetype' ),
log      = require( './log' );

htdocs   = htdocs.replace(/\/+/g, '/');
    
function GetFile( request, response ){
    // 私有属性 
    this.fileContent = '';
    
    this.request     = request;
    this.response    = response;
    this.readFile();
}

/**
 * [getUri 根据url去查找真实的vm文件名]
 * @return {[type]} [如果传了pathname参数的就是从include取文件名，如果没有pathname就是默认取url路径]
 */
GetFile.prototype.getUri = function( pathName ){
        
    var pathname = url.parse( this.request.url ).pathname; // url的pathname
    var uriPath = htdocs + ( pathName || ( pathname==='/'||pathname==='' ? this.request.url+'/index'+Config.VMExtName : pathname.replace( Config.urlExtName, Config.VMExtName ) ) );
    return uriPath.replace(/\/+/g, '/');
    
}

/**
 * [readfile 先判断文件是否存在，不存在的文件响应404，存在的文件调用另外方法读文件详细内容]
 * @param  {[type]} request  [description]
 * @param  {[type]} response [description]
 * @return {[type]}          [description]
 */
GetFile.prototype.readFile = function( pathname ){
        
    var _this = this,
        uri   = this.getUri( pathname );
    
    // 同步可能会有阻塞，所以想一下还是用异步来做吧,就是回调嵌套恶心了点
    fs.exists( uri, function( ext ){
        
        if( ext ){
            
            _this.getContent( uri );
            
        }else{
            var _404Info = (pathname||uri).replace(htdocs.slice(0,-1),'');
            _this.output({
                status: 404,
                data: Config.err404.replace( '{{errorMsg}}', _this.request.method+'=>"'+ _404Info+'"' )||'404 page',
                header: {
                    "Content-Type":fileType[ Config.urlExtName ]
                }
            });
            log.log( 'Not Find File '+_this.request.method+' To "'+ _404Info +'"' );
            
        }
        
    })
    
}

/**
 * [getContent 读取文件内容]
 * @return {[type]} [description]
 */
GetFile.prototype.getContent = function( uri ){
    var _this = this;
    
    // 同步可能会有阻塞，所以想一下还是用异步来做吧,就是回调嵌套恶心了点
    fs.readFile( uri, function( err, data ){
        
        if( err ){
            
            _this.output({
                status: 500,
                data: Config.err500.replace('{{errorMsg}}', typeof err!=="string"?JSON.stringify(err):err )||'500 page',
                header: {
                    "Content-Type":fileType[ Config.urlExtName ]
                }
            });
            log.log( '500 Error Read File '+_this.request.method+' To "'+uri+'"' );
            
        }else{
            
            // include数据的填充
            var findIncludeReg = new RegExp( '<%\\s*include\\(\\s*(["\'])\\s*'+ uri.replace(htdocs.slice(0,-1), '') +'\\s*\\1\\s*\\);?\\s*%>', 'gm' );
            
            // 对html文件进行include的检查处理
            if( '.'+_this.getExtName()==Config.urlExtName ){
                
                _this.fileContent =  _this.fileContent==='' ? data.toString('utf-8') : _this.fileContent.replace( findIncludeReg, data.toString('utf-8') );
                
            }else{
                
                _this.fileContent = data;
                
            }
            
            var includeFilePath = _this.getIncludePath( _this.fileContent );
            // 如果有include公用path文件就会递归方式去查找直到没有找到include路径为止
            if( includeFilePath ){
                
                _this.readFile( includeFilePath );
                
            }else{
                
                _this.output({
                    status: 200,
                    data: _this.fileContent,
                    header: {}
                });
                
            }
            
        }
        
    })
    
}

/**
 * [getExtName 获取url扩展名，以扩展名的不同所响应的content-type就跟着不同]
 * @return {[type]} [description]
 */
GetFile.prototype.getExtName = function(){
    var extName = path.extname( url.parse( this.request.url ).pathname );
    extName = extName=='/'||extName=='' ? Config.urlExtName : extName;
    return extName.slice( 1 );
}

/**
 * [getIncludePath 主要是获取include部分的文件路径]
 * @param  {[type]} content [传入的内容，从内容中用正则提取path]
 * @return {[type]}         [description]
 */
GetFile.prototype.getIncludePath = function( content ){
    
    content = content.toString( 'utf-8' );
    var includePath = /<%\s*include\(\s*(["'])([^<]+)\1\s*\);?\s*%>/gm.exec( content );
    return includePath&&includePath[2];
    
}

/**
 * [output 页面内容输出函数]
 * @param  {[type]} result [将要输出的结果集合，包括输出内容，输出文件编码等]
 * @return {[type]}        [description]
 */
GetFile.prototype.output = function( result ){
    
    var extName   = this.getExtName()||Config.urlExtName.slice(1);
    result.header = Object.assign({
        "Content-Type":fileType[ extName ]||'text/plain',
        "Access-Control-Allow-Origin":"*",
        "Server": 'node server',
        "developer": 'TanShenghu',
        "charset": 'UTF-8'
    }, result.header);
    
    this.response.writeHead(result.status, result.header);
    // this.response.write( result.data, ( Config.urlExtName + ',html,jsp,asp,aspx,shtml,php,xml,svg,text,txt,json,css,js,less,sass' ).indexOf(extName)>-1?'':'binary' );
    this.response.write( result.data );
    this.response.end();
    
}

module.exports = function( request, response ){
    return new GetFile( request, response );
}