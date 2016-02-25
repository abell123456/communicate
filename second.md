# 第二期题目

## 题目1：实现jQuery无new实例化及无限链式对DOM的操作
jQuery是一个设计巧妙，开发使用异常方便的一个专注于对DOM操作的框架，其无限链式的对DOM的操作是实现其'write less,do more'的目标的核心点。
这个题目的目标就是一步步实现一个可以无限链式操作的基础框架。  
**步骤1：理解js继承**  
js的继承分为原型继承和非原型式继承，非原型式的继承又可分为：构造继承、拷贝继承等。  
构造继承实例如下：
```javascript
var Base = function() {  
    this.level = 1;  
    this.name = "base";  
    this.toString = function(){  
        return "base";  
    };  
};  
Base.CONSTANT = "constant";  
   
var Sub = function() {  
    Base.call(this);  
    this.name = "sub";  
};
```
拷贝继承实例（或者直接实现一个extend()方法，又分浅拷贝和深拷贝）：
```javascript
var Base = function() {  
    this.level = 1;  
    this.name = "base";  
    this.toString = function(){  
        return "base";  
    };  
};  
Base.CONSTANT = "constant";  
   
var Sub = function() {  
    var base = new Base();  
    for(var i in base) {
        this[i] = base[i];  
    }
        
    this["name"] = "sub";  
};
```
以上两类比较简单，理解即可。在这里，我们主要用到得是原型继承。js里，充当类的角色的是构造函数，构造函数也是普通的函数，被用来new的函数即被称为构造函数。  
假设我们的构造函数如下：
```javascript
function power(selector){
    
}

power.prototype = {
    constructor: power
};
```
对于constructor，获得一个Function函数实例的时候，其原型里面默认就会有一个constructor属性，指向该函数。那么当我们将函数原型指向另一个原型对象的时候，我们需要重置constructor的值，这样我们后面就可以在实例里面调用`this.constructor`获取到原构造函数。  
**步骤2：实现无new实例化**   
因为我们的目标是调用的时候不需要显式new实例化，那么我们可以执行函数即返回一个new的实例，为了方便，我们可以将要返回的实例的构造函数设置为power的原型上的一个属性，一般叫：init：
```javascript
function power(selector){
    return new power.prototype.init(selector);
}

power.prototype = {
    constructor: power,
    
    init: function(selector){
        return this;
    }
};
```
上面的构造函数，当我们执行new操作后，返回一个实例，那么我们可以将通过selector获取的DOM元素放置到实例上，然后所有的方法都会对实例的指向DOM元素属性来进行操作。  
**步骤3：操作实例的DOM元素**   
那为了方便起见，我们可以将对象设置为一个类数组，用：0、1等下标来指向DOM元素，并给出一个length属性标识元素个数。同时，为了书写方便，我们将power.fn也指向power.prototype.
因此可以将上述构造函数改为如下：
```javascript
function power(selector){
    return new power.fn.init(selector);
}

power.fn = power.prototype = {
    constructor: power,
    
    init: function(selector){
        this[0] = document.querySelector(selector);
        this.length = 1;
        return this;
    },
    
    length: 0
};
```
这样，我们已经可以基本实现想要的效果。但是，当我们需要提前给`power('#id')`返回的实例扩展一些基本的方法的时候，我们必须要给`power.fn.init.prototype`扩展才能扩展到目标对象上，这样比较麻烦。
我们可以设置：
```javascript
power.fn.init.prototype = power.fn;
```
**步骤4：完整的基础框架**   
这样，我们给`power.fn`的扩展就能直接扩展到实例上。下面，我们实现一个比较完整地基础框架，带有`css`，`attr`，`html`等常见方法，且带有上下文context。
```javascript
var toString = {}.toString;

function isArray(ary){
    return toString.call(ary) === '[object Array]';
}

function isFunction(fn){
    return toString.call(fn) === '[object Function]';
}

function isObject(obj){
    return toString.call(obj) === '[object Object]';
}

function isString(str){
    return toString.call(str) === '[object String]';
}

function power(selector, context){
    // 如果selector是方法，则绑定document DOMContentLoaded事件触发时触发回调
    // 为了该事件的浏览器兼容性处理，可参考：https://github.com/dperini/ContentLoaded/blob/master/src/contentloaded.js
    if(isFunction(selector)){
        return power(document).on('DOMContentLoaded', selector);
    } else {
        return new power.fn.init(selector, context);
    }
}

power.fn = power.prototype = {
    constructor: power,
    
    init: function(selector, context){
        // HANDLE: power(""), power(null), power(undefined), power(false)
		if ( !selector ) {
			return this;
		}
		
        if(isString(selector)){
            if(context){
                var doms = context.querySelectorAll(selector);
                
                for(var i = 0, j; j = doms[i++];){
                    this[this.length] = j;
                    this.length++;
                }
            }else {
                this[0] = document.querySelector(selector);
                this.length = 1;
            }
            
            this.context = context;
            this.selector = selector;
        } else if(selector.selector){
            // 表明是power实例
            this.context = context;
            this.selector = selector;
        } else if(selector.nodeType){
            this[0] = selector;
            this.length = 1;
            
            this.context = context;
            this.selector = selector;
        }
        
        return this;
    },
    
    length: 0,
    
    // 设置该数组方法，可以使得浏览器控制台打印power返回实例格式为：[div#demo]而不是：Object，这依赖于浏览器js引擎对数组的判定方式
    splice: [].splice
};

power.fn.init.prototype = power.fn;

// 实现简单的继承
power.extend = power.fn.extend = function(){
    var i = 1,
        len = arguments.length,
        target = arguments[0],
        j;
        
    if(i === len){
        target = this;
        i--;
    }
    
    for(; i< len; i++){
        for(j in arguments[i]){
            target[j] = arguments[i][j];
        }
    }
    
    return target;
};

// TODO:实现事件绑定函数
var on = function(){
    
}();

power.fn.extend({
    on: function(type, fn,data){
        var i = this.length;
        
        for(; --i > 0;){
            on(this[i], type, fn, data);
        }
        
        return this;
    },
    
    css: function(){
        // 略
        
        return this;
    },

    attr: function(){
        // 略
        
        return this;
    },
    
    html: function(){
        // 略
        
        return this;
    }
});
```
这样，我们就可以像jQuery那样实现链式调用了：
```javascript
power('demo').html().css().on();
```
是不是很酷？！真的很酷！
##题目2：实现前端模板引擎
我们在开发的过程中，通常会将页面划分为多个模块，然后以模块为维度来进行开发。在每个模块开发的时候，我们通常又会将该模块划分为模板和数据，数据从服务端通过ajax请求回来，然后结合模板实现页面的渲染，类似于服务端的smarty，Node.js的ejs等。成熟的前端模板引擎有很多，比如：underscore.js的_.template()(可以去分析其源码)，handlebars等。今天我们实现一个能渲染基本数据，又能书写函数代码的模板引擎。先看下如何使用的例子。  
假设我们的模板存在html页面的script元素中：
```html
<script type="text/tpl" id="tpl">
	<div class="data-lang <%if(is_selected){%>selected<%}%>" data-value="<%=value%>">
		<%for(var i = 0,j; j=ary[i++];){%>
		<a href="#"><%= j.text %></a>
		<%}%>
	</div>
</script>
```
从服务端请求回来要渲染的数据是：
```javascript
{
	is_selected: true,
	value: 'test',
	ary: [
		{
			text: 1
		},
		{
			text: 2
		}
	]
}
```
我们渲染引擎方法是：compileTpl()，调用则是：
```javascript
var str = document.querySelector('#tpl').innerHTML;
var data = {
	is_selected: true,
	value: 'test',
	ary: [
		{
			text: 1
		},
		{
			text: 2
		}
	]
};

function compileTpl(){}

console.log(compileTpl(str)(data));
```
下面我们来实现compileTpl()方法。  
**理解Function**  
Function 构造器会创建一个新的 Function 对象。 在 JavaScript 中每个函数都是一个Function对象。使用方法：
```javascript
new Function ([arg1[, arg2[, ...argN]],] functionBody)
```
Function前面的所有参数都是真正的函数实例里的参数，最后一个参数是一个用于被真正执行的函数体字符串。譬如：
```javascript
var data = new Function('data', 'return data;')({
	text: 1
});

console.log(data);
```
基本的使用就是这样。   
**理解eval（或with）**  
eval的作用也是类似于Function，但是它可以直接执行js代码字符串，比如可以这样做变量声明：
```javascript
eval('var a = 1;var b = 2;');
```
而with则是在某个作用域内执行代码，因为js引擎不能对其内部的代码执行进行优化，所以执行一般比较低下。细节的问题可以自己再额外去学习。  
**实现思路**  
理解了Function的使用，那么我们就可以理顺下我们的实现思路了。其核心思路就是：**不同模板对应不同的渲染函数，组装通过Function来生成函数实例的字符串并返回生成的函数，再以data数据为参数渲染出最终结果即可**。 
假定我们的模板引擎标识符是：  
- 代码执行标识是：`<%%>`
- 直接取值标识是：`<%=%>`   
那么我们的compileTpl()函数的轮廓大概是：
```javascript
function compileTpl(str){
	// str基本的处理
	str = String(str)
		.replace('&lt', '<')
		.replace('&rt', '>')
		.replace(/[\r\t\n]/g, '');
		
	var fnBody = '';
	
	// 返回针对str模板生成的函数实例
	return new Function('data', fnBody);
}
```
下面我们来完成fnBody部分。
因为模板中的js代码部分都是直接以data属性来判断的：
```html
<%if(is_text){%>disabled<%}%>
```
所以我们可以将data的所有属性变成声明在函数内的变量：
```javascript
var template_keys = '';
for(var key in data){
	template_keys += ('var '+ key + '=data." + key + ';');
}

eval(template_keys);
```
当然这里也可以用with来实现，自己可以尝试下。  
这样，我们就有了data的所有属性对应的局部变量，函数内部就可以直接来使用。下面我们就开始将模板内的函数代码部分变成fnBody内部可执行的代码。    
因为我们最终的html字符串是一段段的，我们需要一个数组来存放这些片段。假设我们的数组叫：htmlSecs，那么代码变成下面这样：
```javascript
var template_keys = '';
for(var key in data){
	template_keys += ('var '+ key + '=data." + key + ';');
}
eval(template_keys);

var htmlSecs = [];
```
接下来，我们只需要将模板解析成html片段，然后push到数组中。这一块比较难理解。    
假设字符串是：<a><%=text%></a>,我们需要将<%=%>先转化为：typeof(text) === 'undefined'?'':text。然后是处理其中的<%%>格式。  
<%部分我们需要处理成："');"。因为其左半部分不是%>的话就是普通html字符串，此部分我们是直接htmlSecs.push()进去的，所以<%刚好对应push()方法的右边括号部分，多个单引号则是push进去的是字符串，所以用单引号包裹。  
那么对于%>部分，因为我们就是对<%if(boolean){%><div></div><%}%>中间的html字符串部分进行数组push操作，因此右半边转化为：htmlSecs.push('。
于是我们可以单独抽象出此部分的操作为一个单独的函数：
```javascript
var dealTpl = function(str) {
	var left = '<%',
		right = '%>';
		
	return str
		.replace(new RegExp(left + '=(.*?)' + right, 'g'), "',typeof($1)==='undefined'?'':$1,'")
		.replace(new RegExp(left, 'g'), //TODO:)
		.replace(new RegExp(right, 'g'), //TODO:);
};
```
那么完整的compileTpl()方法就是：
```javascript
var compileTpl = function(str) {
	str = String(str)
		.replace('&lt', '<')
		.replace('&rt', '>')
		.replace(/[\r\t\n]/g, '');

	var fnBody = [
		"var htmlSecs=[];",
		"var template_key='';",
		"for(var key in templateData){",
		"template_key+=('var '+key+'=templateData.'+key+';');",
		"}",
		"eval(template_key);",
		"htmlSecs.push('"
	].join('\n') + dealTpl(str) + [
		"');",
		"template_key=null;",
		"return htmlSecs.join('');"
	].join('\n');

	return new Function('templateData', fnBody);
};
```
完成后测试如下：
```html
<script type="text/tpl" id="tpl">
	<div class="data-lang <%if(is_selected){%>selected<%}%>" data-value="<%=value%>">
		<%for(var i = 0,j; j=ary[i++];){%>
		<a href="#"><%= j.text %></a>
		<%}%>
	</div>
</script>
```
```javascript
var str = document.querySelector('#tpl').innerHTML;
console.log(compileTpl(str)({
	is_selected: true,
	value: 'test',
	ary: [{
		text: 1
	}, {
		text: 2
	}]
})); // <div class="data-lang selected" data-value="test"><a href="#">1</a><a href="#">2</a></div>
```
上面就完成了一个最基本的模板渲染引擎。当然，我们还可以作进一步的功能丰富，比如：可以自定义引擎的符号（可以使{{}},{{=}}等），自定义helper(类似于handlebars的handlebars.registerHelper()方法)等。目前还有人基于Virtual-DOM实现了模板引擎，可以参考下：https://github.com/livoras/blog/issues/14

## 题目3：实现前端模块化
如今的前端已经脱离了多年之前刀耕火种的时代，进入了工程化的时代。js语言自身没有模块的限制也可以在使用模块化框架后，辅助前端工程化（多个模块打包成一个一个文件等）得到了很好的解决，让多人的协同开发与合作变得更加容易，彼此的代码也不会再互相干扰。  
下面，我们就实现模块化框架最核心的部分做简单的实现，理解了其实现原理，我们可以更好的使用模块化来进行项目的开发。  
前端的模块化规范有AMD和CMD两种，AMD规范典型的实现代表是require.js，而CMD典型的实现代表则是sea.js，使用构建工具辅以任意的模块化框架，我们就可以像写Node.js似的书写前端代码。  
假设我们的模块化规范如下：  
- 每个js文件就是一个模块；
- 每个模块都是以下面的形式来定义的：  
```javascript
define(id, deps, factory);
```
- factory函数须返回结果，以便其他模块来使用。  
我们的使用示例如下：
```html
<script type="text/javascript" src="./module.js"></script>
<script type="text/javascript" src="./index.js"></script>
```
```javascript
// index.js
define('index', ['a', 'b'], function(a, b) {
    console.log('a:', a); // a: {name: "a", name1: "c-d"}
    console.log('b:', b); // b: {name: "b", name1: "c-d"}
});
```
```javascript
// a.js
define('a', ['c'], function(c) {

    return {
        name: 'a',
        name1: c.name
    };
});
```
```javascript
// b.js
define('b', ['c'], function(c) {

    return {
        name: 'b',
        name1: c.name
    };
});
```
```javascript
// c.js
define('c', ['d'], function(d) {

    return {
        name: 'c' + '-' + d.name
    };
});
```
```javascript
// d.js
define('d', function() {

    return {
        name: 'd'
    };
});
```
我们的嵌套层级已经比较深，如果能像上面那样打印出如期的结果就表明我们的基本功能实现了。  
**理解JSONP**  
通常，我们在解决单向跨域问题的时候，我们经常用到JSONP。那什么是JSONP呢？  
JSONP的实现其实就是：  
1、创建全局的函数，比如：
```javascript
function globalCallback(returnData){
	console.log(returnData);
}
```
2、创建script标签，将其url置为要请求的地址，地址后面加上对应的参数指定全局函数名（如：https://interface.com?callback=globalCallback;  
3、然后将其插入DOM文档树，请求结束后服务端会返回如下形式的内容：
```javascript
globalCallback({
	status: true,
	data:[]
});
```
因为script标签的特殊性，globalCallback函数就会被调用执行。  
这就是JSONP的原理所在，并不深奥。我们的前端模块化也是基于此来实现。  
我们可以指定将script标签插入head标签中：
```javascript
var headEl = document.head || document.querySelector('head') || document.body;
```
下面我们定义插入函数：
```javascript
function insert(url, charset, cb) {
        if (url.split('.').slice(-1) !== 'js') {
            url += '.js';
        }

        if (arguments.length === 2) {
            cb = charset;
            charset = 'UTF-8';
        }

        var script = document.createElement('script');

        script.onload = script.onreadystatechange = function() {
            if (!this.readyState || /loaded|complete/.test(this.readyState)) {
                typeof cb === 'function' && cb();
            }

            script.onload = script.onreadystatechange = null;
        }

        script.type = "text/javascript";
        script.charset = charset;
        script.src = url;

        // TODO: 将script元素插入到head元素中
        
    }
```
剩下的我们就是实现全局的define函数就好了（全局的require()函数其实原理类似）。  
其实define函数就分析两个方面，一个是从顶往下的依赖分析，一个则是从底往上的函数执行。我们一个个来。  
首先，我们可以先定义三个需要用到的辅助变量：
```javascript
	// 模块统一管理对象
    var modules = {};
    // 存放已经记载的模块id
    var loadedModulesIds = [];
    // 存放已经记载完的模块
    var loadedModules = [];
```
以及辅助工具函数：
```javascript
// 判断item是否在ary数组中
function isInArray(ary, item) {
    // TODO: 
}
```
对于每一个通过define定义的模块，我们可以存储他的相关信息，如下：
```javascript
function define(id, deps, factory) {
        if (arguments.length === 2) {
            factory = deps;
            deps = [];
        }

        var module = {
            id: id,
            deps: deps,
            factory: factory
        };
        
        
}
```
然后我们将该模块相关信息存入：modules；并且视为该模块已加载（依赖还未加载）：
```javascript
function define(id, deps, factory) {
        if (arguments.length === 2) {
            factory = deps;
            deps = [];
        }

        var module = {
            id: id,
            deps: deps,
            factory: factory
        };

        modules[id] = module;

        if (!isInArray(loadedModulesIds, id)) {
            loadedModules.push(module);
            loadedModulesIds.push(id);
        }
}
```
下面，我们就加载依赖模块，从而完整的define函数如下：
```javascript
function define(id, deps, factory) {
        if (arguments.length === 2) {
            factory = deps;
            deps = [];
        }

        var module = {
            id: id,
            deps: deps,
            factory: factory
        };

        modules[id] = module;

        if (!isInArray(loadedModulesIds, id)) {
            loadedModules.push(module);
            loadedModulesIds.push(id);
        }

        if (!deps.length) {
            // 没有依赖直接返回结果
            return factory();
        } else {
            // 加载依赖
            loadDeps(module, exec);
        }
    }
```
其中，loadDeps是加载依赖模块的函数，exec是所有依赖模块加载完成后的回调。他们分别如下：
```javascript
	// loadDeps函数
	// 从上往下加载
    var loadNum = 0;

    function loadDeps(module, cb) {
        var deps = module.deps;
        var depsLength = deps.length;
        var depsObj = {};
        var id = module.id;

        deps.forEach(function(dep, index) {
            loadNum++;

            // 加载完立即执行，然后执行回调
            insert(dep, function() {
                if (!isInArray(loadedModulesIds, id)) {
                    loadedModules.push(module);
                    loadedModulesIds.push(id);
                }

                if (!--loadNum) {
                    // 全部加载完
                    cb && cb();
                }
            });
        });
    }
```
其中的关键就是loadNum变量的控制。因为模块（js文件）加载完之后会立即执行，所以每个模块加载完后define函数都是就是立即执行的，所以会马上加载刚被加载完的模块的依赖模块，此时loadNum就会加1，每加载完一个模块该变量就减少1，直到所有模块都加载完，此时该变量的值变成0，这个时候我们就可以来调用我们的回调函数了。  
所以总的一个执行顺序就是：define --> loadDeps --> loadNum++ --> insert --> define --> loadDeps --> loadNum++ --> insert......此时，才会去第一次执行第一个的insert函数的回调函数，才有机会执行loadNumn--，可以自己多去理一理。总之记住关键一点，就是加载一个js文件后，先执行js文件代码，后触发回调，这个可以自己实验下。  
然后是exec()函数：
```javascript
// 从下往上执行
    function exec() {
        var collection = [];
        var firstModule = loadedModules[0];
        var factory = firstModule.factory;

        // 收集依赖的模块
        firstModule.deps.forEach(function(dep) {
            collection.push(modules[dep]);
        });
		// 最顶层的模块的工厂函数使用后面的模块的工厂函数执行的返回结果
        factory.apply(0, depsModulesExec(collection));

        loadedModules = [];
    }

    function depsModulesExec(depsModules) {
        var res = [];

        depsModules.forEach(function(module) {
            var factory = module.factory;

            if (module.deps.length) {
                var collection = [];

                // 收集依赖的模块
                module.deps.forEach(function(dep) {
                    collection.push(modules[dep]);
                });
				// 递归实现
                res.push(factory.apply(0, depsModulesExec(collection)));
            } else {
                res.push(factory());
            }
        });

        return res;
    }
```
经过第一步的模块收集，第二步只需要将所有模块的工厂函数从下往上一次执行，将最底下的函数的执行结果传给上面依赖它的模块使用，一直到最顶层的第一个函数即可。  
基本的功能就是这样。其实我们还有几个问题没有很好地去解决，比如：  
- 模块id与文件路径的匹配问题；
- 文件路径的处理（sea.js有完善的路径处理方案）；
- 如何引入（一般使用require()）非js文件。  
结合构建工具，我们可以以Node.js的方式来书写前端代码，其实现原理就是：解析出js代码里的依赖模块，将各个模块使用自己的模块框架进行包装，然后按照依赖顺序最后打包进一个js文件中。具体可以参考这篇文章：[browserify--将js代码解析为AST树并解析AST树](http://blog.csdn.net/fendouzhe123/article/details/46890749)。  

## 实现前端Class
## 实现前端MVVM框架
