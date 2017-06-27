/**
 *   log日志的读/写
*/
var fs  = require( 'fs' ),
getDate = function( all ){
    var now = new Date();
    return now.getFullYear()+'-'+(now.getMonth()+1)+'-'+now.getDate() + ( all?' '+now.getHours()+':'+now.getMinutes()+':'+now.getSeconds():'' );
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