/*
 * adjustViews: 
 * Called when dismissable views are hidden. Adjusts top position of all
 * views below the hidden view so there is no white space left in 
 * the parent view.
 * 
 * Properties:
 * - height: the height of the closed view prior to being closed
 * 
 */
adjustViews = function(e) {
    for(x = (dismissable_views.indexOf(e.source) + 1); x < dismissable_views.length; x++) {
 
        var animation = Titanium.UI.createAnimation();
        animation.top = dismissable_views[x].rect.y - e.height;
        animation.duration = 500;
        animation.setCurve(Ti.UI.ANIMATION_CURVE_EASE_IN_OUT);
 
        dismissable_views[x].animate(animation);
 
    }
}
 
 
/*
 * Create an array of dismissable views.
 * Once the app is complete this array will be created
 * dynamically.
 */
var dismissable_views = [];
 
/*
 * Set a callback function to be executed when dismissable
 * views are dismissed.
 */
$.child1.setOnClose(adjustViews);
$.child2.setOnClose(adjustViews);
 
dismissable_views.push($.child1.indexView);
dismissable_views.push($.child2.indexView);
dismissable_views.push($.footer);
 
/*
 * postlayout:
 * Executed when the parent controller in this view has completed
 * rendering. Adjusts top position of all dismissable views so they
 * are neatly stacked and positioned based upon their dynamic
 * size.
 */
postlayout = function(e) {
    $.index.removeEventListener('postlayout', postlayout);
 
    var current_top = 100;
 
    for(x = 0; x < dismissable_views.length; x++) {
        dismissable_views[x].setTop(current_top);
        current_top += dismissable_views[x].rect.height;
    }
};
 
$.index.addEventListener('postlayout', postlayout);