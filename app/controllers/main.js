/**
 * Controller for the text screen
 * 
 * @class Controllers.text
 * @uses core
 */
var APP = require("core");

var CONFIG = arguments[0];

APP.log("debug", "text | " + JSON.stringify(CONFIG));

$.heading.color = APP.Settings.colors.hsb.primary.b > 70 ? "#000" : APP.Settings.colors.primary;

$.NavigationBar.setBackgroundColor(APP.Settings.colors.primary);

if(CONFIG.isChild === true) {
	$.NavigationBar.showBack(function(_event) {
		APP.removeChild();
	});
}

if(APP.Settings.useSlideMenu) {
	$.NavigationBar.showMenu(function(_event) {
		APP.toggleMenu();
	});
} else {
	$.NavigationBar.showSettings(function(_event) {
		APP.openSettings();
	});
}

$.NavigationBar.text = "Archivio Teatro Regio";

var showRightbar = function() {
	$.mainview.animate({
		width:"300dp"
	});
};
var hideRightbar = function() {
	$.mainview.animate({
		width:Ti.UI.FILL
	});
};

$.NavigationBar.showRight({
	image: "/icons/white/action.png",
	callback: function() {
		if($.rightbar.shown) {
			hideRightbar();
			$.rightbar.shown = false;
		} else {
			showRightbar();
			$.rightbar.shown = true;
		}
		Ti.UI.createAlertDialog({
			message: 'Right top button pushed',
		    ok: 'OK',
		    title: 'Error'
		}).show();
	}
});

// Calculating orientationchange to refresh mainview width
Ti.Gesture.addEventListener('orientationchange', function(e) {
	 $.mainview.applyProperties({width:Ti.UI.FILL});
	 /*	
	if(e.source.isPortrait()) {
		$.mainview.applyProperties({
	    width:Ti.UI.FILL
	    });
	} else if(e.source.isLandscape()) {
		$.view1.applyProperties({
	    	top: 50,
	        left: 100
		});
	}*/
});