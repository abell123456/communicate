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
    return toString.call(fn) === '[object Object]';
}

function isString(str){
    return toString.call(fn) === '[object String]';
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
    },

    attr: function(){
        // 略
    },
    
    html: function(){
        // 略
    }
});
```
