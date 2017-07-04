/**
 *   log日志的读/写
*/
var fs  = require( 'fs' ),
f0      = function( val ){
    val+='';
    return val.length<2 ? '0'+val : val;
},
getDate = function( all ){
    var now = new Date();
    return now.getFullYear()+'-'+f0(now.getMonth()+1)+'-'+f0(now.getDate()) + ( all?' '+f0(now.getHours())+':'+f0(now.getMinutes())+':'+f0(now.getSeconds()):'' );
},
dir     = './logs/';

if( !fs.existsSync( dir ) ){
    fs.mkdir( dir );
}

module.exports = {
    log: function( err ){
        var error = Array.isArray(err)||({}.toString.call(err)==='[object Object]') ? JSON.stringify( err ) : err.toString();
        error     = getDate( true )+': ' + error;
        fs.writeFile( dir + getDate() + '.log', error+'\n\n', {encoding:'utf-8',flag:'a'}, function( er ){
            if( er ) throw new TypeError( er );
            console.error( '\033[31m' + error + '\033[0m' );
        })
    },
    getlog: function( date ){
        return fs.readFileSync( dir + (date||getDate()) + '.log', 'utf-8' );
    }
}