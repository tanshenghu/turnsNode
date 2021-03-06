/**
 * 整个框架工程最核心的主导文件,
 * 由它去串联所有的扩展方法以及controller,转发等等.
 */
var 
fs            =   require( 'fs' ),
path          =   require( 'path' ),
url           =   require( 'url' ),
output        =   require( './output' ),
expand        =   require( './expand' ),
controllers   =   [],
findCtlr      =   function( req, controllers ){
    
    return controllers.find(function( item ){
        return item.type===req.method && item.interface===url.parse( req.url ).pathname;
    });
    
},
db            =   require( './db' );


module.exports = function( app ){
    
    // 对象方法扩展
    expand( {use:app, params:controllers} );
    
    var controllerFiles = fs.readdirSync( './controller/' );
    
    controllerFiles.forEach(function( fileName ){
        
        path.extname( fileName )==='.js' && require( '../controller/' + fileName )( app );
        
    })
    
    // 数据库 操作设置方法
    db.databaseRoute( app );
    
    //  request 请求的监听
    app.on('request', function(request, response){
        
        // 对象方法的扩展
        expand( {request:request, response:response} );
        
        var _IF = findCtlr( request, controllers );
        _IF && typeof _IF.factory==='function' ? _IF.factory.call( request, request, response ) : output.call( request, request, response );
    
    })
    
}