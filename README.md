# tanshenghu™  TSH

# HTML development node service   < Support cross domain >

---
### 16-11-11对v1.0.0版进行重构修改及功能扩充,两个版本不管是代码结构,还是程序设计思路逻辑都有很大不同。建议使用当前master分支版本
####  目前这个版本也只针对前端开发设计,后期若有需要我将花点时间结合模板引擎ejs,vue等改成一套MVC框架.
### 优点：
>       1.无依赖第三方模块包，全部都是自己写的原生脚本，体积小也方便
>       2.支持include语法(N个页面共用一套header头部footer尾部等等) 如：<% include("/include/header.html"); %>
>       3.可玩点新花样改路由扩展名,如:http://www.abc.com/index.jsp别人以为你的是jsp页面，其实是静态页面
>       4.可以写一些自己的controller,用于前期工作自己模拟假数据,如果想调真实数据也可以哦,接口转发.
>       5.支持数据转发,我们可以用这个node做数据转发达到跨域请求数据的效果,详细看demo。
>       说到跨域很多前端同学可能第一想到jsonp，可知jsonp是否能满我们所有场景需求，jsonp是否也有缺点?答案是肯定的!

> 前端静态资源根目录在htdocs目录下，dtdocs目录不可更改名称，确保本地安装node环境以后在根目录直接命令node server就可运行服务
***

### top.html 内容
```html
<section> top content... </section>
```

### header.html 内容
```html
<% include('/include/top.html'); %>
<header>
    header content...
</header>
```

### footer.html 内容
```html
<% include('/include/top.html'); %>
<footer>
    footer copyright content...
</footer>
```

```html
<!DOCTYPE html>
<html lang="zh-CN">
<head>
    <meta charset="UTF-8">
    <meta http-equiv="X-UA-Compatible" content="IE=edge">
    <meta name="Keywords" content="">
    <meta name="Description" content="">
    <meta name="Author" content="TanShenghu">
    <title>demo</title>
</head>
<body>
    <% include('/include/header.html'); %>
    <div>
        content
    </div>
    <% include('/include/footer.html'); %>
</body>
</html>
```

### Node code
```javascript

module.exports = function( app ){
    
    // 可以用这种方法来模拟前端开发时所用的 假数据
    app.use('get', '/getlist.json', function( request, response, turnHost ){
        
        var result = {
            type: 'method GET',
            success:true,content:[
                {username:"zhangsan",sex:"man",phone:"86-135****8548"},
                {username:"lishi",sex:"man",phone:"86-135****8548"},
                {username:"wangwu",sex:"man",phone:"86-135****8548"}
            ]
        }
        
        response.send( result );
        
    })
    // 可以用这种方法走生产环境的接口 获取真实数据   放心ajax支持跨域
    .use('post', '/nodeDataList.json', function( request, response, turnHost ){
        
        turnHost.post('http://test.yjsvip.com/yjsWebService/hongbao/qiangHongbaoByActiveId', function( data ){
            
            response.send( data.content, {status:data.status, header:{"Content-Type":"application/json"}} );
            
        }, request );
        
    });
    
}

```

### 完     The End