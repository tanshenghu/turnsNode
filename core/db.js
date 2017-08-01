/**
 * 一个简单 小型的数据库
 * 先暂时停工, 后面有时间再继续...
 */
var fs = require( 'fs' ),
Config = require( '../config/config' );

var dbDir = './db', dbName = 'db.db';

var inspect = function(){
    // 数据表结构
    var structure = [{user:[{id:"1",user:"root",password:"",power:0},{id:"2",user:"admin",password:"123456",power:1}],fields:[{name:"id",type:"string"},{name:"user",type:"string"},{name:"password",type:"string"},{name:"power",type:"string"}]}];
    
    if( !fs.existsSync( dbDir ) ){
        fs.mkdir( dbDir );
        fs.writeFileSync(dbDir+'/'+dbName, JSON.stringify(structure), 'utf-8');
    }
    
    if( !fs.existsSync( dbDir+'/'+dbName ) ){
        fs.writeFileSync(dbDir+'/'+dbName, JSON.stringify(structure), 'utf-8');
    }
    
}

// 查检 当前环境是否有数据库文件, 如果没有就生成一个
inspect();

var getdb = function(){
    return JSON.parse( fs.readFileSync(dbDir+'/'+dbName, 'utf-8') );
},getKey = function( o ){
    return ( Object.keys( o )+'' ).replace(/,?fields,?/g, '');
}

/* < ============================= 操作方法提供 ================================== > */

exports.query = function( sql ){
    
    
    
}

exports.where = function( tableName, whereStr ){
    
    var data = exports.select( tableName ),
    _wrs     = {},
    queryRes = [];
    var loop = function( da, type ){
        // var regRes = /^([^&|]+?)[&|]/g.exec( whereStr ), items = regRes[ 1 ].split( '=' );
        var regRes = /^(.+?((?:\&\&)|(?:\|\|)|$))/.exec( whereStr ),
        regFirst   = regRes[ 0 ],
        items      = regFirst.replace(/(?:&&)|(?:\|\|)$/, '').split( '=' );
        whereStr   = whereStr.replace( regRes[ 0 ], '' );
        var tile   = da.filter(function(v){return v[ items[ 0 ] ]===items[ 1 ];});
        queryRes   = queryRes.concat( tile );
        if( tile.length==0 && type!='||' ){ queryRes.length=0 }
        if( whereStr.length ){
            loop( regFirst.slice(-2)=='||' ? data : tile, regFirst.search(/((?:\&\&)|(?:\|\|))$/)>-1 ? regFirst.slice(-2) : undefined );
        }
        
    }
    if( data ){
        loop( data );
        return queryRes;
    }
    return null;
}

exports.update = function( tableName, where, setVal ){// where 参数: userName=root
    
    var sv = where.split('=');
    var v1 = sv[0], v2 = sv[1];
    var selectData = exports.where( tableName, v1, v2 );
    
}

exports.delete = function(){
    
}

exports.insert = function(){
    
}

exports.select = function( tableName ){
    
    var content = getdb();
    return (content.find(function(v){
        return getKey(v)==tableName ? true : false;
    })||{})[ tableName ];
    
}

exports.count = function( tableName ){
    
    return (exports.select( tableName )||[]).length;
    
}

exports.whereCount = function( tableName, fields ){
    
    return (exports.where( tableName, fields )||[]).length;
    
}

/* < ============================ 后台设置方法提供 =================================== > */
var setDataBase = function( request, response ){
    
    this.formRequest(function( d ){
        var ret = request.db.whereCount( 'user', 'user='+d.userName+'&&password='+d.password );
        response.send( Html( ret==0?'error':'yes' ) );
    })
    
}

var setValidate = function( request, response ){
    response.send( Html( 'validate' ) );
}

exports.databaseRoute = function( app ){
    
    app.use('get', '/database.html', setValidate);
    
    app.use('post', '/database.html', setDataBase);
    
    app.use('get', '/database_getTableNames.json', function( request, response ){
        
        response.send( {success: true, data:getdb()} );
        
    });
    
}

// 生成 并返回 页面
var Html = function( type ){
    var Page = Config.dbpage,
    _body    = '';
    if( type=='validate' ){
        _body = '<form action="" method="post"><table><tr><th>帐户:</th><td><input type="text" name="userName"></td></tr><tr><th>密码:</th><td><input type="password" name="password"></td></tr><tr><th></th><td><input type="submit" value="登 录"></td></tr></table></form>';
        Page  = Page.replace(/\<script\>[\s\S]*?\<\/script\>/mg, '');
    }else if( type=='error' ){
        _body = '<h1>userName or passworld error</h1>';
        Page  = Page.replace(/\<script\>[\s\S]*?\<\/script\>/mg, '');
    }else if( type=='yes' ){
        _body = '<div id="tableList"></div>';
    }
    return Page.replace('{{content}}', _body);
}