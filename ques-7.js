// 给定一个字符串，仅由a,b,c 3种小写字母组成。
// 当出现连续两个不同的字母时，你可以用另外一个字母替换它，如有ab或ba连续出现，你把它们替换为字母c； 有ac或ca连续出现时，你可以把它们替换为字母b； 有bc或cb 连续出现时，你可以把它们替换为字母a。 你可以不断反复按照这个规则进行替换，你的目标是使得最终结果所得到的字符串尽可能短，求最终结果的最短长度。 输入：字符串。长度不超过200，仅由abc三种小写字母组成。
// 输出： 按照上述规则不断消除替换，所得到的字符串最短的长度。
// 例如：输入cab，输出2。因为我们可以把它变为bb或者变为cc。
// 输入bcab，输出1。
// 尽管我们可以把它变为aab -> ac -> b，也可以把它变为bbb，但因为前者长度更短，所以输出1。
// 请用js实现：


// 使用贪心算法 + 递归，局部最优达到整体最优
// 从左到右遍历尝试消除字符；
// 如果不能消除跳出递归
// 如能消除，用再前一位和再后一位字符评价是否能保证最短(即替换成的字母能否保证和前后两字母都不同)，能则消，否则继续遍历；
// 一旦有消除发生，重新递归消除后的新字符串；
// 遍历结束时，检查是否存在可以消除但却没通过评价的情况，如果有则消除，重新递归。
function getMinLen(str) {
    // 如果不能消除，即所有字母一样，则跳出递归
    if (isAllSame(str)) {
        return str;
    }

    var replaceInfo;
    for (var i = 0; i < str.length - 1; i++) {
        replaceInfo = getReplaceInfo(str, i);

        if (isReplaceIsMin(str, replaceInfo)) {
            str = replaceStr(str, replaceInfo);
            return getMinLen(str);
        }
    }

    // 检查是否存在可以消除但却没通过评价的情况
    replaceInfo = getReplaceInfo(str, 0);
    if (!isReplaceIsMin(str, replaceInfo)) {
        str = replaceStr(str, replaceInfo);
        return getMinLen(str);
    }

    function replaceStr(str, replaceInfo) {
        var index = replaceInfo.index;
        var newChar = replaceInfo.newChar;

        str = str.slice(0, index) + newChar + str.slice(index + 2);
        return str;
    }
}

function isAllSame(str) {
    return /^([a-c])\1*$/.test(str);
}

// 当连续两字母不同即可消除，不可消除返回 null，
// 可消除返回一个对象，其中属性 replaceStr 为这俩字母, index 为第一个字母在 str 的索引
function getReplaceInfo(str, index) {
    var newStr = str.substring(index);
    var regInfo = newStr.match(/ab|ba|ac|ca|bc|cb/);
    var newChar = getNewCharIfReplace(str, regInfo.index);
    return {
        replaceStr: regInfo[0],
        index: regInfo.index,
        newChar: newChar
    };
}

function getNewCharIfReplace(str, index) {
    var char1 = str.charAt(index);
    var char2 = str.charAt(index + 1);

    var index1 = 'abc'.indexOf(char1);
    var index2 = 'abc'.indexOf(char2);
    // index's sum = 3, index3 = sum - index1 - index2
    var index3 = 3 - index1 - index2;
    return 'abc'.charAt(index3);
}

// 局部最优，即替换成的字母能否保证和前后两字母都不同。
function isReplaceIsMin(str, replaceInfo) {
    var replaceIndex = replaceInfo.index;
    var newChar = replaceInfo.newChar;
    // 当前或后没字母的时候用，''代替
    var beforeChar = replaceIndex - 1 < 0 ? '' : str.charAt(replaceIndex - 1);
    var afterChar = replaceIndex + 2 >= str.length ? '' : str.charAt(replaceIndex + 2);

    return newChar !== beforeChar && newChar !== afterChar;
}

// 测试
console.log('len:', getMinLen('bcab').length);
console.log('len:', getMinLen('bca').length);

var time1 = Date.now();
// 100char
console.log('len:', getMinLen('bcababcacacaaabcbacbacbaacbacbacbacbaccbabcabcbabcbacbabcbacbacbabcbabcbabcbacbcacacbabbbaabaccbacbc').length);
var time2 = Date.now();
console.log('time:', time2 - time1);

var time1 = Date.now();
// 500char
console.log('len:', getMinLen('bcababcacacaaabcbacbacbaacbacbacbacbaccbabcabcbabcbacbabcbacbacbabcbabcbabcbacbcacacbabbbaabaccbacbcababcacacaaabcbacbacbaacbacbacbacbaccbabcabcbabcbacbabcbacbacbabcbabcbabcbacbcacacbabbbaabaccbacbcababcacacaaabcbacbacbaacbacbacbacbaccbabcabcbabcbacbabcbacbacbabcbabcbabcbacbcacacbabbbaabaccbacbcababcacacaaabcbacbacbaacbacbacbacbaccbabcabcbabcbacbabcbacbacbabcbabcbabcbacbcacacbabbbaabaccbacbcababcacacaaabcbacbacbaacbacbacbacbaccbabcabcbabcbacbabcbacbacbabcbabcbabcbacbcacacbabbbaabaccbacbcababcaca').length);
var time2 = Date.now();
console.log('time:', time2 - time1);

// 测试结果
// ➜  communicate git:(master) ✗ node ques-7.js                                                                                                                             12:04:14
// len: 1
// len: 2
// len: 1
// time: 5
// len: 1
// time: 39
