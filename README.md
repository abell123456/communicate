# communicate

前端开发交流 -- js常用基础训练。训练会以题目的形式给出，请在有TODO的地方将代码补充完整，*将各题目js代码移放至对应js文件夹*。
-------

## 第一期题目

### 题目1：一步步实现Angular.js的依赖注入
> 先看一个例子：
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
### 题目2：常用的数字操作方法：
- 请将数字字符串:'123'转化为数字：123：
```javascript
// TODO:
```
- 使用`Number`函数将数字字符串数组：['1','2']转化为数字数组：[1,2]:
```javascript
var ary = ['1','2'];
// TODO:
```

