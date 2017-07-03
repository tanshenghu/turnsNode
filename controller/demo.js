/**
 * controller DEMO 示例  包括转发
 *
 * interface Document
 * app.use(type, url, callback);  type默认GET,   url与callback属于必选参
 */
module.exports = function( app ){
    
    // get方式请求的接口
    app.use('get', '/getlist.json', function( request, response ){
        
        var result = {
            type: '您刚才用了GET请求接口',
            success:true,
            content:[
                {username:"张三",sex:"男",phone:"12345"},
                {username:"李四",sex:"男",phone:"24680"},
                {username:"王五",sex:"男",phone:"13579"}
            ]
        }
        // 每一个接口一定要send方法，向客户端返回数据，否则客户端会一直处于等待状态!
        response.send( Object.assign( result, request.getRequest() ) );
        
    })
    // 这里支持链式写法,   post请求
    .use('post', '/getlist.json', function( request, response ){
        
        var result = {
            type: '您刚才用了POST请求接口',
            success:true,content:[
                {username:"张三",sex:"男",phone:"12345"},
                {username:"李四",sex:"男",phone:"24680"},
                {username:"王五",sex:"男",phone:"13579"}
            ]
        }
        
        //  通过formRequest获取客户端post过来的参数数据 
        request.formRequest(function( body, size ){
            
            response.send( Object.assign( result, body ) );
            
        })
        
    });
    
    
    
    
    
    /* ============================================================================================================ */
    /* ===========================< 上面是普通接口模式, 下面是接口做转发 >============================ */
    /* ============================================================================================================ */
    
    
    
    
    
    app.use('get', '/node_demo.json', function( request, response ){
        
        // 自己这块接口先获取参数信息，然后再传递给转发模块
        var params = request.getRequest();
        
        //  get 方式转发除了get以外还有另外一种del方法与post很相似，唯一不同的地方就是我在get方法上做了处理，它是可以传报文的，而del则不会传报文
        
        // 调用 转发模块里面的 get方法
        this.get('/yjsWebService/index/getMyIndex', params, function( data ){
            //   data.content真实数据内容(前端最关心的数据),   data.fileSize(真实数据大小字节),   data.status(状态码)   data.response(response对象)
            response.send( data.content );
            
        })
        
    })
    
    // 这里支持链式写法
    .use('post', '/node_demo.json', function( request, response ){
        /*
        //   先用formRequest获取post提交过来的参数，可以对参数进行修改之后然后再传给转发模块
        request.formRequest(function(body, size){
            
            request.post('/node.php', body, function( data ){
                
                response.send( data.content );
                
            });
            
        })
        */
       //   不传参数，直接转发，但是我在转发模块里面做了默认捞参数的处理，自动取前端post过来的所有参数自动去传发
       this.post('/yjsWebService/index/getMyIndex', function( data ){
            
            // 可以通过第二个参数来设置响应头与状态码，我只是提供这个方法，不过一般默认就行了，不要去改它
            response.send( data.content, {status:data.status, header:{"Content-Type":"application/json"}} );
            
        });
        
    });
    
    
}