# communicate

前端开发交流 -- js常用基础训练。训练会以题目的形式给出，请在有TODO的地方将代码补充完整，*将各题目js代码移放至对应js文件夹*。
-------

## 第一期题目

### 题目1：一步步实现Angular.js的依赖注入
先看一个例子：
```javascript
function TodoCtrl($scope, $http) {
    $http.get('users/users.json').success(function(data) {
        $scope.users = data;
    });
}
```
这是一个典型的 AngularJS 控制器，它执行 HTTP 请求，从一个 JSON 文件读取数据，并把它传递给目前的上下文，我们并没有执行 TodoCtrl 函数，甚至没有传递任何参数的机会，框架帮我们做了，这些 $scope 和 $HTTP 变量从哪里来的？这是一个超级酷的功能，像黑魔法一样，让我们来看看它是如何实现的。

#### 简化目标实现
假设Angular.js的$scope，$http实现如下：
```javascript
var $scope = {};
$http = {
    get: function(url){
        console.log(url);
        return this;
    },
    success: function(cb){
        var data = {
            test: 1
        };
        cb(data);
    }
};
```
现在假设我们知道了控制器函数名字叫`TodoCtrl`，那么我们就能获取到该函数，后面的工作就是解析出该控制器的参数依赖，
然后传入我们已经定义的变量，如：$scope、$http等，实现依赖注入。  
假设我们独立的依赖注入器的框架如下：
```javascript
var injector = {
    storage: {},
    register: function(name, resource) {
        this.storage[name] = resource;
    },
    resolve: function(target) {
        // 步骤1：将函数target转化为字符串：
        // TODO:
        var fnText = ;
        // 步骤2：健壮性起见，使用正则将函数的注释删除掉：
        var STRIP_COMMENTS = ;
        fnText = fnText.replace(STRIP_COMMENTS, '');
        // 步骤3：使用正则解析出函数的函数的依赖参数（字符串形式）：
        // TODO:
        var FN_ARGS = ;// 解析函数依赖参数正则
        // TODO:
        var argDecl = ;// 通过fnText.match()方法取得依赖参数的字符串数组
        // 步骤4：将真正依赖的变量存放到args数组中：
        var args = [];

        for (var i = 0; i < argDecl.length; i++) {
            if (this.storage[argDecl[i]]) {
                args.push(this.storage[argDecl[i]]);
            }
        }
        
        // 步骤5：返回待调用函数
        return function() {
            target.apply({}, args);
        }
    }
};

injector.register('$scope', $scope);
injector.register('$http', $http); 

TodoCtrl = injector.resolve(TodoCtrl);
TodoCtrl();
```
### 题目2：常用的数字&字符串操作方法：
- 请将数字字符串:'123'转化为数字：123：
```javascript
// TODO:
```
- 使用`Number`函数将数字字符串数组：['1','2']转化为数字数组：[1,2]:
```javascript
var ary = ['1','2'];
// TODO:
```
- 学习`String.prototype.replace()`方法，完成以下需求：  
 win32/win64及其上，通过git命令:
`git rev-parse --show-toplevel`获取项目本地目录路径的时候存在一个获取不准确的bug，假设获取到的路径转化后是：`D:/d/workbench/f2ehint-hook`，请使用`String.prototype.replace()`方法将其转化为：`D:/workbench/f2ehint-hook`:
 ```javascript
 // TODO:完成替换匹配正则
 var regexp = ; 
 var path = 'D:/d/workbench/f2ehint-hook';
 path = path.replace(regexp, '$1');
 console.log(path);
 ```
操作数字的parseInt()/parseFloat()等方法，字符串的String.prototype.substr()/String.prototype.substring()/String.prototype.slice()/String.prototype.match()/String.prototype.replace()等基本操作方法请熟练掌握。  

### 题目3：实现简单的Promise
能够减少js金字塔式的异步回调的方法特别多，比如：Promise、async/await、Generator等。今天我们就实现一个简单的Promise，以理解其基本原理，更详细的使用方式可参考q.js、jQuery.js等库的API使用方法。阅读下面的代码，完成部分未完成的部分。
```javascript
var noop = function() {};

function Promise() {
	this.callbacks = [];
}

Promise.prototype = {
	constructor: Promise,

	resolve: function(result) {
		// TODO:
	},

	reject: function(result) {
		// TODO:
	},

	complete: function(type, result) {
		while (this.callbacks[0]) {
			this.callbacks.shift()[type].call(this, result);
		}
	},

	then: function(successHandler, failureHandler) {
		this.callbacks.push({
			resolve: successHandler || noop,
			reject: failureHandler || noop
		});
	}
};

// 测试
var p = new Promise();

setTimeout(function() {
	console.log('setTimeout');
	p.resolve('test');
}, 2000);

p.then(function(result) {
	console.log(result);
});
```
### 题目4：使用原生js实现事件代理
当我们需要给某个元素的所有子元素添加事件处理的时候，使给每一个子元素添加事件代理，一方面会增添内存消耗，另一方面也会增加性能消耗。此时，使用事件代理能够很好的解决此问题。事件代理的主要原理就是只给父元素添加事件绑定，然后增添需要代理的子元素集合，如果当前点击的元素在子元素集合中，就执行事件处理函数。  
简单起见，假设我们的浏览器支持`document.querySelector()/document.querySelectorAll()`API，事件添加使用`el.addEventListener()`方法，那么我们可以简单的实现一个事件代理。  
另外，执行事件添加的时候，请理解：
- 什么是事件捕获与事件冒泡，如何阻止事件冒泡，如何阻止默认事件行为等；
- input输入框的oninput、onfocus、onblur、onchange等事件；
- select选择框的onchange事件；
- 如何检测鼠标右键、屏蔽鼠标右键；
```html
<ul id="test">
	<li>1</li>
	<li>2</li>
	<li class="active">3</li>
	<li class="active">4</li>
</ul>
```
```javascript
function delegate(parentEl, child, eventName, handler) {
	var childCollection = parentEl.querySelectorAll(child);
	// TODO:使用Array.prototype.slice()方法将集合转化为真正的数组
	var childs = ;

	parentEl.addEventListener(eventName, function(e) {
		var eventTarget = e.target;
		
		if (~childs.indexOf(eventTarget)) {
			handler(e);
		}
	}, false);
}

delegate(document.querySelector('#test'), 'li.active', 'click', function(e) {
	console.log(e.target);
});
```
###题目5：算法：谷歌搜索之星算法实现
给你一天Google搜索日志，你怎么设计算法找出是否有一个搜索词，它出现的频率占所有搜索的一半以上？如果肯定一个搜索词占大多数，你能怎么提高你的算法找到它，再假定搜索日志就是内存中的一个数组，能否有O(1)的空间，O(n)时间的算法？  
题目分析：  
如果没有O(1)的空间，O(n)时间的要求的话我们可以有很多的办法来解决这个问题，比如可以用排序方法将数组排序后然后再找出其中位数即是我们要找的单词（时间复杂度为nlogn），或者构造一个hash，hash名为各个搜索词，hash值为搜索词出现的次数（通过遍历搜索词，出现的搜索词相应则加1），这样就能找到最大的搜索词。  
但是题目要求算法O(1)的空间，O(n)时间。一般情况下O(n)时间复杂度都是去遍历长度为n的数组一遍，这里我们也不例外。
我们可以遍历数组，并把遍历到的值作为当前值，并记其首次出现的时候help值为1，如果下一个数仍然和它相同则help值加1，否则减1，如果其个数为负的则记当前遍历的这个值为当前值，并置help值为1。因为题目中有保证说该搜索值肯定会占一半以上，所以遍历完后当前值肯定是要搜索的结果，并且help值大于0。  
阅读上面的算法实现描述，然后用js实现：
```javascript
function getMostWord(wordsAry){
// TODO: 请完成实现
}
console.log(getMostWord(["a","b","c","a","d","e","a","a","b","a","f","a","a","a","b"])); //"a"
```
###题目6：算法：js归并排序实现
有两个已经排好序的数组，如何将这两个数组合并且合并后的数组仍然是有序的？  
试题分析：  
    这一道题目是一位同学和大家分享的他去百度面试web前端开发的职位时面试官问道的一道算法题目。看起来貌似和我们的题目没有关系，但是如果你知道归并排序的核心实现你应该能立马反应过来。如果你不知道也没有关系，在我们下面的一番分析之后你应该就能明白了。  

其实解决一些算法问题的途径有很多，分治法就是其中的一种。分治法从语义即可知道，就是“分而治之”，把原来的一个大问题分解成一个个的很小的小问题，然后分别去解决小问题之后再把答案合并起来，组成大问题的解，各个击破，循序渐进，最后把问题顺利成章的解决掉。  

如果一个比较大的问题能够分解成许多比较小的问题，而且这些小问题的结构、解法与大问题相类似，这个时候我们可以利用递归这一神器巧妙地来解决问题。递归的优点很明显，结构条理清晰，能够有效地减少代码量，但缺点是在数据量较大的时候效率不高，会占用额外的内存。  

归并排序就是利用了分而治之、递归解决问题的思路。如果两个数组都是有序的，那么我们可以定义一个新的数组，然后两个数组都从0开始依次分别比较两个数组中值得大小，较小的放进新数组中并将位置后移一位，知道最后把两个数组所有的值都放进新数组中。这样算法的时间复杂度是O(m+n)的，即为两个数组的长度之和。  

这个问题其实是很简单的。那么它究竟和归并排序有毛关系呢？我们接着思考归并排序。  

我们可以把一个大数组分成两个较小的数组，然后其中每一个较小的数组又可以分成两个较小的数组，一直分到最后，也就是大数组中的每一项都成为一个独立的小数组，而且都是有序的（只有一项的数组当然有序）。这个时候，我们可以利用上面把两个有序数组合并成为一个数组的算法将其中两个数组合并为一个，然后这一个有两项的数组是有序的，同样的再将另外两项合并，所有的都合并完之后再将这些两项的有序数组合并，依次进行下去，直到只剩下两个大的有序数组，再合并即可得到有序的一个数组。  
阅读上述的解题思路，然后用js实现之：
```javascript
// 数组ary从p到q是有顺序的，从q到r是有顺序的
    function merge(ary,p,q,r){
        var a = [],
            b = [];
        for(var i = p;i<=q;i++){
            a[a.length] = ary[i];
        }
        for(i = q+1;i<r+1;i++){
            b[b.length] = ary[i];
        }
        a[a.length] = Infinity;
        b[b.length] = Infinity;
        var newAry = [],
            m = 0,
            n = 0,
            len;
        for(i = 0,len = r-p+1;i<len;i++){
            if(a[m] <= b[n]){
                ary[p+i] = a[m];
                m++;
            }else{
                ary[p+i] = b[n];
                n++;
            }
        }
        return ary;
    }
   
    console.log(merge([12,9,10,1,3],1,2,4));
   
    function mergeSort(ary,p,r){
        // TODO:完成实现
    }
    var ary = [2,5,3,1,4,6,8,9,7,10,23,12,7],
        len = ary.length;
    console.log(mergeSort(ary,0,len-1)); //[1, 2, 3, 4, 5, 6, 7, 7, 8, 9, 10, 12, 23]
```
###题目7：算法：字符串消除
给定一个字符串，仅由a,b,c 3种小写字母组成。当出现连续两个不同的字母时，你可以用另外一个字母替换它，如有ab或ba连续出现，你把它们替换为字母c； 有ac或ca连续出现时，你可以把它们替换为字母b； 有bc或cb 连续出现时，你可以把它们替换为字母a。   你可以不断反复按照这个规则进行替换，你的目标是使得最终结果所得到的字符串尽可能短，求最终结果的最短长度。   输入：字符串。长度不超过200，仅由abc三种小写字母组成。   
输出： 按照上述规则不断消除替换，所得到的字符串最短的长度。   
例如：输入cab，输出2。因为我们可以把它变为bb或者变为cc。             
输入bcab，输出1。  
尽管我们可以把它变为aab -> ac -> b，也可以把它变为bbb，但因为前者长度更短，所以输出1。  
请用js实现：
```javascript

```
