function delegate(parentEl, child, eventName, handler) {
    var childCollection = parentEl.querySelectorAll(child);
    var childs = Array.prototype.slice.call(childCollection); // SimplyY's code

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
