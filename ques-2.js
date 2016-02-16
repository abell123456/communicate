// Number方法

// 1.请将数字字符串:'123'转化为数字：123：
var str = '123';
// SimplyY's code
var int = parseInt(str, 10);
console.log(int);

// 2.使用Number函数将数字字符串数组：['1','2']转化为数字数组：[1,2]:
var ary = ['1','2'];
// SimplyY's code
var intAry = ary.map(Number);
console.log(intAry);

// 3.完成替换匹配正则
// 考虑到了 win 下多种盘符的问题
var regexp = /^([A-Z]+:)(\/[^\/]+)/; 
var path = 'D:/d/workbench/f2ehint-hook';
path = path.replace(regexp, '$1');
console.log(path);

// 测试：代码运行结果
// communicate git:(master) ✗ node ques-2.js
// 123
// [ 1, 2 ]
// D:/workbench/f2ehint-hook
