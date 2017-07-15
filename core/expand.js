/**
 *   对原生方法的拓展
*/
var log     = require( './log' ),
    url     = require( 'url' ),
querystring = require( 'querystring' ),
turnHost    = require( './turnhost' ),
db          = require( './db' );

var dbQuery = {
    select : db.select,
    count : db.count,
    query : db.query,
    where : db.where,
    update : db.update,
    delete : db.delete,
    insert : db.insert
}

module.exports = function( _OS ){

    var objs = {

        use: function( app, ctrls ){

            app.use = function( type, url, callback ){
                if( arguments.length<2 ){

                    log.log( 'app.use(type, url->required, callback->required)' );
                    throw new TypeError( 'app.use(type, url->required, callback->required)' );

                }else if( typeof callback==='undefined' ){
                    callback = url;
                    url      = type;
                    type     = 'get';
                }
                ctrls.push({
                    type: type.toUpperCase(),
                    interface: url,
                    factory: callback
                });

                return this;

            }

        },

        response: function( response ){
            // send方法的扩展
            response.send = function( content, Header ){
                Header = Header || {};
                this.writeHead( Header.status||200, Object.assign({"Access-Control-Allow-Origin":"*", "Content-Type":(content+'').search(/^jQuery[\d_]+\(/ig)==0?"text/javascript":/^<.*>$/mg.test((content+'').trim())?"text/html; charset=UTF-8":"application/json"}, Header.header) );
                this.write( ({}.toString.call( content )=='[object Object]')||Array.isArray( content ) ? JSON.stringify( content ) : content.toString() );
                this.end();
            }
            response.redirect = response.redirect || function( status, url ){
                if( isNaN(status) ) url = status;status = 302;
                this.writeHead(status, {'Location': url});
                this.end();
            }
        },

        request:  function( request ){
            // get方式参数获取方法
            request.getRequest = function( _url ){
                var search = url.parse( _url && typeof _url==='string' ? _url : this.url ).query,
                query = querystring.parse( search&&search!=='null'?search:'' );
                //for(var i in query){
                //    query[ i ] = decodeURIComponent( query[ i ] );
                //}
                return query;
            }
            // post方式参数获取方法
            request.formRequest = function( callback ){
                var _this    = this,
                    isupload = _this.rawHeaders && _this.rawHeaders.some(function(item){
                        return item.indexOf('multipart/form-data')>-1}),
                    content  = '',
                    fileSize = 0;
                this.on('data', function( chunk ){
                    content  += chunk.toString( isupload ? 'binary' : 'utf-8' );
                    fileSize += chunk.length;
                })
                this.on('end', function(){
                    // 附件上传时decodeURIComponent可能会报错，后期想方法做处理

                    var body = isupload ? new Buffer( content, 'binary' ) : content;
                    
                    if( !isupload ){
                        body = querystring.parse( body&&body!=='null'?body:{} );
                        //for(var i in body){
                        //    body[ i ] = decodeURIComponent( body[ i ] );
                        //}
                    }
                    
                    typeof callback==='function'&&callback.call( undefined, body, fileSize );

                })

            }
            
            // 转发方式调用   method:   create, update, delete, put等
            request.get = function(){
                turnHost.get.apply( this, [].splice.call(arguments,0) );
            }
            
            request.post = function(){
                turnHost.post.apply( this, [].splice.call(arguments,0) );
            }
            
            // db 操作
            request.db = dbQuery;
            
        }

    }

    for(var i in _OS){
        typeof objs[ i ]==='function' && objs[ i ]( _OS[i], _OS['params'] );
    }

}
