function TodoCtrl($scope, $http) {
    $http.get('users/users.json').success(function(data) {
        $scope.users = data;
    });
}

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

var injector = {
    storage: {},
    register: function(name, resource) {
        this.storage[name] = resource;
    },
    resolve: function(target) {
        // 步骤1：将函数target转化为字符串：
        var fnText = target.toString();
        // 步骤2：健壮性起见，使用正则将函数的注释删除掉：
        var STRIP_COMMENTS = /((\/\/.*$)|(\/\*[^]*?\*\/))/mg;
        fnText = fnText.replace(STRIP_COMMENTS, '');
        // 步骤3：使用正则解析出函数的函数的依赖参数（字符串形式）：
        var FN_ARGS = /function\s*[^\(]*\(([^\)]*)\)/;// 解析函数依赖参数正则
        var argDecl = fnText.match(FN_ARGS)[1].split(',');// 通过fnText.match()方法取得依赖参数的字符串数组
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
        };
    }
};

injector.register('$scope', $scope);
injector.register('$http', $http);

TodoCtrl = injector.resolve(TodoCtrl);
TodoCtrl();
