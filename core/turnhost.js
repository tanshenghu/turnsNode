/**
 * 
 * 数据转发模块，注意有的时候可能后端(java or php python等)他们可能会做限制或身份验证，
 * 这个时候可能会比较麻烦，可以跟后端协商一下联调“协议”后端做个特殊处理，
 * 只要检查到报文中有Proxy-Author就不做限制，正常分发数据过来就行了
 * 
 */
var 
http        = require( 'http' ),
https       = require( 'https' ),
url         = require( 'url' ),
querystring = require( 'querystring' ),
config      = require( '../config/config' ),
log         = require( './log' ),
Host        = config.turnHost.replace(/\/?$/g,''),
Port        = Host.indexOf('https')==0?443:80;

//   域名与端口号的拆解
Host = Host.replace(/:(\d+)$/g, function(a,b){
    if( b ){
        Port = b;
        return '';
    }
});

if( Host.indexOf('http')===-1 ){
    log.log( 'turnUri error: `Host` http or https required!' );
}

// 数据请求报文转发
var take = function( options ){
    var content  = '',
        fileSize = 0,
        Tid      = null,
        outCout  = 0,   // 输出次数
        params   = Buffer.isBuffer( options.params ) || typeof options.params==='string' ? options.params : querystring.stringify( options.params ),
        _path    = options.pathname + ( options.type.toUpperCase()==='GET' ? options.pathname.indexOf('?')==-1 ? '?' + params : '&' + params : '' ),
        _Host    = url.parse( Host ).hostname;
    
    // 如果path中已经存在域名   那就用path中的域名, 也就是说path中的域名优先于配置文件中的转发域名
    if( _path.indexOf('http')===0 ){
        var ouri = url.parse( _path );
           _Host = ouri.hostname;
           Port  = ouri.port||Port;
           _path = ouri.path;
    }
    
    var _Headers = Object.assign( {"proxy-author":"TanShenghu"}, options.headers, {host: _Host+( !Port||Port==80?'':':'+Port )} );
    
    delete _Headers['accept-encoding'];
    delete _Headers['content-length'];
    
    var requester   = _Host.indexOf('https')===0 ? https : http,
        turnOptions = {
        host: _Host,
        port: Port,
        method: options.type,
        path: _path,
        headers: _Headers,
    };
    console.info( '\033[36m数据转发参数: \033[34m' + JSON.stringify( Object.assign( turnOptions, {params: params} ) ) );
    var req = requester.request(turnOptions, function( res ){
        clearTimeout( Tid );
        res.setEncoding('utf8');
        res.on('data', function( chunk ){
            content  += chunk;
            fileSize += chunk.length;
        })
        res.on('end', function(){
            outCout==0&&typeof options.callback==='function'&&options.callback( {content:content, fileSize:fileSize, status:this.statusCode||200, response:res} );
            outCout++;
        })
        
    });
    
    req.on('error', function( err ){
        clearTimeout( Tid );
        outCout==0&&typeof options.callback==='function'&&options.callback( {content:"", fileSize:0, status:500, response:null} );
        outCout++;
        log.log( 'turnUri onerror: ' + err );
    })
    
    req.write( options.type.toUpperCase()==='GET' ? '' : params ); // new Buffer("hello", "utf-8")
    req.end();
    
    //   一般情况响应就是5秒钟，在这里我多设置了500毫秒做为缓冲
    Tid = setTimeout(function(){
        req.abort();
        outCout==0&&typeof options.callback==='function'&&options.callback( {content:"", fileSize:0, status:408, response:null} );
        outCout++;
        log.log( 'turnUri error: `' + _path + '` time out!' );
    }, config.turnTimeout*1000||5500);
    
}
module.exports = {
    
    // getData 与 get唯一的区别就是del没有报文，而get是可以设置报文的建义还是用get
    getData: function( _path, params, callback ){
        
        if( typeof params==='function' ){
            callback = params;
            params   = {};
        }
        
        if( typeof params==='string' ){
             params = querystring.parse( params );
        }
        
        var content  = '',
            fileSize = 0;
        
        if( Host.search(/http(?:s)?:\/\//)===0 ){
            
            var _url = _path.indexOf('http')==0 ? _path : Host+(Port?':'+Port:'')+_path;
            _url += JSON.stringify(params)==='{}' ? '' : ( url.parse( _url ).search ? '&' : '?' ) + querystring.stringify( params );
            var requester = Host.indexOf('https')===0||_url.indexOf('https')===0 ? https : http;
            console.info( '\033[36m数据转发参数: \033[34m' + _url );
            requester.get(_url, function( res ){
                
                res.setEncoding('utf8');
                res.on('data', function( chunk ){
                    content  += chunk;
                    fileSize += chunk.length;
                })
                res.on('end', function(){
                    typeof callback==='function' && callback( {content:content, fileSize:fileSize, response: res} );
                })
              
            })
            .on('error', function(){
                log.log( 'turnUri error: ' + path );
                typeof callback==='function' && callback();
            });
          
        }
        
    },
    get: function( path, params, callback, context ){
        
        var request = this;
        
        if( typeof params==='function' ){
            callback = params;
            params   = {};
        }
        
        if( Host.search(/http(?:s)?:\/\//)===0 ){
            
            if( JSON.stringify(params)=='{}' ){
                Object.assign( params, request.getRequest() );
            }
            take({
                type: 'GET',
                pathname: path,
                params: params,
                headers: request.headers,
                callback: callback
            });
            
        }
        
    },
    post: function( path, params, callback, context ){
        
        var request = this;
        
        if( typeof params==='function' ){
            context  = callback;
            callback = params;
            params   = undefined;
        }
        
        if( Host.search(/http(?:s)?:\/\//)===0 ){
            
            // 如果已经传了post参数就直接调用take方法，发请求
            if( params ){
                
                take({
                    type: 'POST',
                    pathname: path,
                    params: params,
                    headers: request.headers,
                    callback: callback
                });
                
                return;
                
            }
            
            // 如果没有传post参数的话，会自动去取post中的参数，取完参数信息之后进入end方法再去调用take方法
            
            request.formRequest(function( bodyParams, size ){
                
                take({
                    type: 'POST',
                    pathname: path,
                    params: bodyParams,
                    headers: request.headers,
                    callback: callback
                });
                
            })
            
        }
        
    }
    
}