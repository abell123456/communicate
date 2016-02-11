// SimplyY's code
function getMostWord(wordsAry){
    if (wordsAry.length < 1) {
        console.log('empty words array');
        return;
    }

    var help = {
        name: '',
        value: 0,
        setCurrentValue: function(name) {
            this.name = name;
            this.value = 1;
        }
    };

    wordsAry.forEach(function(item, index) {
        if (index === 0) {
            help.setCurrentValue(item);
            return;
        }

        if (item === help.name) {
            help.value++;
        } else {
            help.value--;
            if (help.value < 0) {
                help.setCurrentValue(item);
            }
        }
    });

    return help.name;
}
console.log(getMostWord(["a","b","c","a","d","e","a","a","b","a","f","a","a","a","b"])); //"a"

// 运行结果
// communicate git:(master) ✗ node ques-5.js
// a
