var noop = function() {};

function Promise() {
    this.callbacks = [];
}

Promise.prototype = {
    constructor: Promise,

    resolve: function(result) {
        this.complete('resolve', result); // SimplyY's code
    },

    reject: function(result) {
        this.complete('reject', result); // SimplyY's code
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

// 运行结果
// communicate git:(master) ✗ node ques-3.js
// setTimeout
// test
