var args = arguments[0] || {};
 
$.index.top = args.top;
$.label.text = args.text;
 
var onClose;
exports.indexView = $.index;
 
function close_click() {
 
    var height = $.index.size.height;
 
    var animation = Titanium.UI.createAnimation();
    animation.height = 0;
    animation.opacity = 0;
    animation.duration = 500;
    animation.setCurve(Ti.UI.ANIMATION_CURVE_EASE_IN_OUT);
 
    $.index.animate(animation);
 
    if(onClose) {
        onClose({source: $.index, height: height});
    }
 
};
 
exports.setOnClose = function(e) {
    onClose = e;
};